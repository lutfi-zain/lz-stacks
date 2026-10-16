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
