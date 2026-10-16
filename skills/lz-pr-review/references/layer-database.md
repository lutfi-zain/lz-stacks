# Database & Storage Layer Review Reference (`layer-database.md`)

**Discipline:** Database Concurrency, Transaction Scope & Storage Scalability  
**Canonical Sources:** PostgreSQL Wiki ("Don't Do This"), Markus Winand (*Use The Index, Luke!*), Supabase Core, Vlad Mihalcea  
**Prefix:** `db-`

---

## Rule Catalog by Impact

### 1. Concurrency, Locking & Transaction Scope (CRITICAL)

#### `db-lock-ddl-timeout`
- **Impact:** CRITICAL
- **Why:** Running `ALTER TABLE` without a lock timeout can queue behind long transactions, blocking all subsequent reads and writes, taking down the entire database pool.
- **Incorrect:**
  ```sql
  -- Blocks all queries on 'orders' if another query holds an AccessShareLock
  ALTER TABLE orders ADD COLUMN status_code VARCHAR(32) DEFAULT 'PENDING' NOT NULL;
  ```
- **Correct:**
  ```sql
  -- Set low lock timeout so DDL fails fast rather than cascading outage
  SET lock_timeout = '2s';
  ALTER TABLE orders ADD COLUMN status_code VARCHAR(32) DEFAULT 'PENDING' NOT NULL;
  ```
- **Remedy:** Apply explicit `lock_timeout` before DDL statements in migration scripts.

#### `db-lock-batching`
- **Impact:** CRITICAL
- **Why:** Unbounded bulk `UPDATE` or `DELETE` on thousands of rows causes lock escalation (row locks converting to exclusive table locks), blocking concurrent operations.
- **Incorrect:**
  ```sql
  -- Locks millions of rows at once; saturates undo/redo log and locks table
  DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
  ```
- **Correct:**
  ```sql
  -- Batched deletion with pause to yield locks
  WHILE 1 = 1 LOOP
    DELETE FROM audit_logs 
    WHERE id IN (
      SELECT id FROM audit_logs 
      WHERE created_at < NOW() - INTERVAL '90 days' 
      LIMIT 1000
    );
    EXIT WHEN NOT FOUND;
    PERFORM pg_sleep(0.05);
  END LOOP;
  ```
- **Remedy:** Introduce batched looping with sleep intervals for large data purging.

#### `db-tx-network-call`
- **Impact:** CRITICAL
- **Why:** Executing external HTTP/gRPC requests inside a database transaction holds DB connections and locks for seconds, causing connection pool exhaustion.
- **Incorrect:**
  ```typescript
  await db.transaction(async (tx) => {
    await tx.orders.updateStatus(orderId, 'PROCESSING');
    // ❌ Anti-pattern: If payment gateway hangs for 10s, DB connection is held!
    const receipt = await paymentClient.charge(amount);
    await tx.orders.attachReceipt(orderId, receipt.id);
  });
  ```
- **Correct:**
  ```typescript
  // 1. Mutate DB first in short transaction
  await db.orders.updateStatus(orderId, 'PROCESSING');
  // 2. Perform external network call OUTSIDE transaction
  const receipt = await paymentClient.charge(amount);
  // 3. Update DB in second short transaction
  await db.orders.attachReceipt(orderId, receipt.id);
  ```
- **Remedy:** Separate orchestration from persistence; remove network I/O from transactions.

---

### 2. Query Performance & Indexing (HIGH)

#### `db-sargable-predicate`
- **Impact:** HIGH
- **Why:** Wrapping indexed columns in functions (e.g. `LOWER()`, `YEAR()`, `DATE()`) or leading wildcards (`LIKE '%term'`) invalidates B-Tree index scans and forces full table scans.
- **Incorrect:**
  ```sql
  -- Invalidates B-Tree index on 'created_at' and 'email'
  SELECT * FROM users WHERE LOWER(email) = 'user@example.com';
  SELECT * FROM transactions WHERE DATE(created_at) = '2026-10-16';
  ```
- **Correct:**
  ```sql
  -- SARGable predicates: index utilized directly
  SELECT * FROM users WHERE email = 'user@example.com'; -- Or create functional index: CREATE INDEX idx_users_lower_email ON users (LOWER(email));
  SELECT * FROM transactions WHERE created_at >= '2026-10-16 00:00:00' AND created_at < '2026-10-17 00:00:00';
  ```
- **Remedy:** Rewrite query to compare bare columns against constants or create functional indexes.

#### `db-index-foreign-keys`
- **Impact:** HIGH
- **Why:** PostgreSQL and MSSQL do NOT automatically index foreign key columns. Deleting a parent row or running joins triggers sequential table scans and share locks on the child table.
- **Incorrect:**
  ```sql
  CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    quantity INT
  );
  -- ❌ Missing index on order_id!
  ```
- **Correct:**
  ```sql
  CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    quantity INT
  );
  CREATE INDEX idx_order_items_order_id ON order_items(order_id);
  ```
- **Remedy:** Create explicit indexes on all foreign key reference columns.

#### `db-n-plus-one`
- **Impact:** HIGH
- **Why:** Querying child records row-by-row inside an application loop generates $N+1$ network roundtrips to the database.
- **Incorrect:**
  ```typescript
  const users = await db.users.findMany({ where: { active: true } });
  for (const user of users) {
    user.orders = await db.orders.findMany({ where: { userId: user.id } }); // N queries
  }
  ```
- **Correct:**
  ```typescript
  // 1 single query via eager loading or single batched IN query
  const users = await db.users.findMany({
    where: { active: true },
    include: { orders: true }
  });
  ```
- **Remedy:** Use ORM `include` / `JOIN` / DataLoader batching.

#### `db-index-composite-order`
- **Impact:** HIGH
- **Why:** Composite indexes `(col_a, col_b)` only accelerate queries filtering by `col_a` first. Putting range columns before equality columns prevents index scans on subsequent columns.
- **Incorrect:**
  ```sql
  -- Index: (created_at, tenant_id)
  -- ❌ Range on created_at blocks index traversal for equality on tenant_id!
  SELECT * FROM invoices WHERE tenant_id = 't-123' AND created_at >= '2026-01-01';
  ```
- **Correct:**
  ```sql
  -- Index: (tenant_id, created_at)
  -- ✅ Rule: Equality columns FIRST, range/sort columns LAST
  CREATE INDEX idx_invoices_tenant_created ON invoices (tenant_id, created_at DESC);
  SELECT * FROM invoices WHERE tenant_id = 't-123' AND created_at >= '2026-01-01';
  ```
- **Remedy:** Reorder composite index columns: `equality` columns first, `range/order` columns last.

#### `db-query-unbounded-oom`
- **Impact:** CRITICAL
- **Why:** Selecting unbounded collections into application memory without `LIMIT` or streaming causes Out-Of-Memory (OOM) crashes as tables grow in production.
- **Incorrect:**
  ```typescript
  // ❌ In production with 2M rows, this consumes 4 GB RAM and crashes pod!
  const allTransactions = await db.transactions.findMany();
  return allTransactions.filter(t => t.status === 'FAILED');
  ```
- **Correct:**
  ```typescript
  // ✅ Keyset pagination, explicit LIMIT, or database-side filter
  const failedTransactions = await db.transactions.findMany({
    where: { status: 'FAILED' },
    take: 100,
    orderBy: { id: 'desc' }
  });
  // Or stream via database cursor for batch processing
  ```
- **Remedy:** Enforce mandatory `LIMIT` / cursor streaming on all collection queries.

---

### 3. Schema Evolution & Migration Safety (HIGH)

#### `db-migr-expand-contract`
- **Impact:** HIGH
- **Why:** Renaming or dropping columns synchronously breaks instances running previous deployment versions during rolling releases.
- **Incorrect:**
  ```sql
  -- ❌ Immediate breaking change: Old pods querying 'phone' crash instantly!
  ALTER TABLE customers RENAME COLUMN phone TO mobile_number;
  ```
- **Correct:**
  - **Phase 1 (Expand):** Add new column `mobile_number`, dual-write in backend.
  - **Phase 2 (Migrate):** Backfill historical data from `phone` to `mobile_number`.
  - **Phase 3 (Contract):** Switch reads to `mobile_number`, deprecate and drop `phone` in subsequent release.
- **Remedy:** Adopt Expand-Contract (Parallel Change) 3-phase migration pattern.

#### `db-conn-pool-exhaustion`
- **Impact:** HIGH
- **Why:** Acquiring raw DB clients without releasing them in `finally` / `defer` blocks permanently leaks connection slots.
- **Incorrect:**
  ```typescript
  const client = await pool.connect();
  const res = await client.query('SELECT * FROM config');
  return res.rows; // ❌ Leaked client if exception thrown or forgot release!
  ```
- **Correct:**
  ```typescript
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM config');
    return res.rows;
  } finally {
    client.release(); // ✅ Always released back to pool
  }
  ```
- **Remedy:** Enforce `try...finally` connection release or scope wrappers.

#### `db-conn-idle-in-transaction`
- **Impact:** CRITICAL
- **Why:** Leaving an open transaction uncommitted or unrolled-back (e.g. error in application code without rollback) holds a dormant `idle in transaction` connection, blocking VACUUM, holding row locks, and causing connection pool starvation.
- **Incorrect:**
  ```typescript
  const client = await pool.connect();
  await client.query('BEGIN');
  const res = await client.query('SELECT * FROM accounts WHERE id = $1 FOR UPDATE', [id]);
  if (res.rows[0].balance < 0) {
    // ❌ Forgotten ROLLBACK! Leaves connection in 'idle in transaction' holding lock!
    client.release();
    return { error: 'Negative balance' };
  }
  await client.query('COMMIT');
  client.release();
  ```
- **Correct:**
  ```typescript
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await client.query('SELECT * FROM accounts WHERE id = $1 FOR UPDATE', [id]);
    if (res.rows[0].balance < 0) {
      await client.query('ROLLBACK'); // ✅ Explicit rollback
      return { error: 'Negative balance' };
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK'); // ✅ Guarantees rollback on error
    throw err;
  } finally {
    client.release(); // ✅ Always released back to pool
  }
  ```
- **Remedy:** Wrap raw transactions in `try...catch...finally` ensuring `ROLLBACK` on all early exit or error branches.
