# Backend & Distributed Systems Review Reference (`layer-backend.md`)

**Discipline:** Backend Concurrency, Network Resilience & API Contracts  
**Canonical Sources:** Michael Nygard (*Release It!*), Sentry Engineering, Martin Fowler, Chris Richardson (*Microservices Patterns*)  
**Prefix:** `be-`

---

## Rule Catalog by Impact

### 1. Network Resilience & Cascading Failures (CRITICAL)

#### `be-timeout-bound`
- **Impact:** CRITICAL
- **Why:** Outgoing HTTP, gRPC, or microservice calls without explicit timeouts can hang indefinitely when the downstream hangs, exhausting server threads/connections and crashing the caller.
- **Incorrect:**
  ```python
  # ❌ In Python requests, default timeout is None (hangs forever!)
  response = requests.get("https://payment-vendor.com/verify")
  ```
- **Correct:**
  ```python
  # ✅ Always set explicit connect and read timeouts
  response = requests.get("https://payment-vendor.com/verify", timeout=(3.05, 10.0))
  ```
- **Remedy:** Set explicit connection and read deadlines on all network clients.

#### `be-retry-backoff-jitter`
- **Impact:** CRITICAL
- **Why:** Immediate retry loops or fixed intervals generate a "Thundering Herd" that overwhelms a recovering service.
- **Incorrect:**
  ```typescript
  while (attempts < 3) {
    try { return await sendRPC(); }
    catch (e) { attempts++; } // Immediate retry hammers server
  }
  ```
- **Correct:**
  ```typescript
  // Exponential backoff with random jitter
  const backoff = Math.min(maxDelay, baseDelay * Math.pow(2, attempts));
  const jitter = Math.random() * backoff;
  await sleep(jitter);
  ```
- **Remedy:** Use exponential backoff with full jitter for retry policies.

---

### 2. Concurrency & Worker Lifecycle (HIGH)

#### `be-concurrency-race`
- **Impact:** HIGH
- **Why:** Reading a counter/balance, modifying it in application memory, and writing it back allows race conditions where concurrent updates overwrite each other.
- **Incorrect:**
  ```go
  // In-memory read-modify-write race condition
  item, _ := db.GetInventory(itemId)
  item.Stock = item.Stock - 1
  db.Save(item)
  ```
- **Correct:**
  ```sql
  -- Atomic database update
  UPDATE inventory SET stock = stock - 1 WHERE id = :id AND stock >= 1;
  ```
- **Remedy:** Use atomic database increments, conditional updates (`WHERE version = :v`), or distributed locks (Redis Redlock).

#### `be-concurrency-goroutine-leak`
- **Impact:** HIGH
- **Why:** Spawning asynchronous tasks/goroutines without `context.Context` cancellation or bounded channels causes worker leakage over time.
- **Incorrect:**
  ```go
  go func() {
    for {
      msg := <-unbufferedChan // Blocks forever if sender exits!
      process(msg)
    }
  }()
  ```
- **Correct:**
  ```go
  go func(ctx context.Context) {
    for {
      select {
      case <-ctx.Done():
        return // Clean exit on request cancellation
      case msg := <-ch:
        process(msg)
      }
    }
  }(ctx)
  ```
- **Remedy:** Pass `context.Context` to all asynchronous worker routines.

#### `be-loop-complexity-hotpath`
- **Impact:** HIGH
- **Why:** Nested loops ($O(n^2)$) searching across large arrays block the CPU and event loop, causing server timeouts.
- **Incorrect:**
  ```typescript
  // ❌ O(N * M) nested scan: for 10k items, executes 100M operations!
  const matched = users.map(user => ({
    ...user,
    department: departments.find(d => d.id === user.departmentId)
  }));
  ```
- **Correct:**
  ```typescript
  // ✅ O(N + M) using Hash Map for O(1) lookups
  const deptMap = new Map(departments.map(d => [d.id, d]));
  const matched = users.map(user => ({
    ...user,
    department: deptMap.get(user.departmentId)
  }));
  ```
- **Remedy:** Index lookup collections into a `Map` or `Set` before iterating.

#### `be-memory-oom-buffer`
- **Impact:** CRITICAL
- **Why:** Buffering large file uploads, report exports, or huge JSON responses entirely into RAM causes Out-Of-Memory (OOM) heap crashes.
- **Incorrect:**
  ```typescript
  // ❌ Reads entire 2 GB file into heap memory
  const fileBuffer = await fs.promises.readFile(largeFilePath);
  await s3Client.putObject({ Bucket: 'b', Key: 'k', Body: fileBuffer });
  ```
- **Correct:**
  ```typescript
  // ✅ Stream chunks directly with backpressure
  const fileStream = fs.createReadStream(largeFilePath);
  await s3Upload({ Bucket: 'b', Key: 'k', Body: fileStream });
  ```
- **Remedy:** Use Node.js / Go streams or chunked readers for large I/O payloads.

---

### 3. Error Handling & Data Integrity (HIGH)

#### `be-error-wrapping-loss`
- **Impact:** HIGH
- **Why:** Catching an exception and re-throwing a generic error or returning `null` destroys the root cause stack trace, masking the real defect.
- **Incorrect:**
  ```csharp
  catch (Exception ex) {
      // ❌ Destroys original stack trace and masks primary error!
      throw new ApplicationException("Order creation failed");
  }
  ```
- **Correct:**
  ```csharp
  catch (Exception ex) {
      // ✅ Preserves inner exception for CloudWatch/Sentry diagnosis
      throw new ApplicationException("Order creation failed", ex);
  }
  ```
- **Remedy:** Wrap exceptions with the inner causal exception preserved.

#### `be-error-masked-secondary`
- **Impact:** CRITICAL
- **Why:** Catch blocks that attempt recovery or logging by accessing unvalidated properties can throw a secondary error (e.g. `NullReferenceException`), masking the true primary root cause and making production debugging impossible.
- **Incorrect:**
  ```csharp
  try {
      await ProcessOrderAsync(order);
  } catch (Exception ex) {
      // ❌ If ex.Data or order.Customer is null, throws NullReferenceException!
      // Secondary error completely masks the original SQL/network exception!
      _logger.LogError("Failed: " + ex.InnerException.Message);
      throw;
  }
  ```
- **Correct:**
  ```csharp
  try {
      await ProcessOrderAsync(order);
  } catch (Exception ex) {
      // ✅ Null-safe logging preserves the primary exception intact
      _logger.LogError(ex, "Failed to process order {OrderId}", order?.Id);
      throw;
  }
  ```
- **Remedy:** Ensure catch blocks are fail-safe and preserve primary exception objects without throwing secondary NullReferenceExceptions.

#### `be-error-swallowed-silent`
- **Impact:** HIGH
- **Why:** Empty `catch` blocks silently swallow failures, causing data corruption or mysterious downstream bugs with zero audit trail.
- **Incorrect:**
  ```typescript
  try {
    await syncUserStatus(user);
  } catch (e) {
    // ❌ Silent failure: nobody knows sync failed!
  }
  ```
- **Correct:**
  ```typescript
  try {
    await syncUserStatus(user);
  } catch (err) {
    logger.warn({ err, userId: user.id }, 'Non-fatal status sync failed; queued for retry');
    await deadLetterQueue.push({ userId: user.id, err: err.message });
  }
  ```
- **Remedy:** Log every handled exception with context; never leave catch blocks empty.

#### `be-dual-write-outbox`
- **Impact:** HIGH
- **Why:** Updating a database and publishing an event to a message broker (Kafka/RabbitMQ) sequentially without transactional guarantees leads to data divergence if one step fails.
- **Incorrect:**
  ```typescript
  await db.orders.create(order);
  await kafkaProducer.send({ topic: 'orders', message: order }); // ❌ Fails if Kafka is down!
  ```
- **Correct:**
  ```typescript
  // Transactional Outbox Pattern: Save event in DB transaction
  await db.transaction(async (tx) => {
    await tx.orders.create(order);
    await tx.outboxEvents.create({ topic: 'orders', payload: order });
  });
  // Separate CDC/poller processes outbox reliably
  ```
- **Remedy:** Adopt the Transactional Outbox Pattern for event publishing.

#### `be-idempotency-key`
- **Impact:** HIGH
- **Why:** Mutation endpoints (payment, order creation) called multiple times due to client retries can charge customers twice.
- **Incorrect:**
  ```typescript
  app.post('/api/charges', async (req, res) => {
    const charge = await paymentGateway.charge(req.body);
    res.json(charge);
  });
  ```
- **Correct:**
  ```typescript
  app.post('/api/charges', async (req, res) => {
    const idempotencyKey = req.headers['idempotency-key'];
    const charge = await idempotencyService.run(idempotencyKey, () => 
      paymentGateway.charge(req.body)
    );
    res.json(charge);
  });
  ```
- **Remedy:** Enforce `Idempotency-Key` headers on non-idempotent mutation APIs.
