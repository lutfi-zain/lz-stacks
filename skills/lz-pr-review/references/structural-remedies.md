# Structural Remedies Catalog (`structural-remedies.md`)

**Discipline:** Architectural Refactoring & Concrete Code Restructuring  
**Source:** Addy Osmani (*code-review-and-quality*), Martin Fowler (*Refactoring to Patterns*)  

A Staff-level review **never** just says "this is complex" or "this is slow". It provides a **named structural remedy** that the author can immediately implement.

---

## Catalog of Named Remedies

### 1. Replace Conditional Cascade with Strategy / Dispatch Map
- **When to use:** Long `switch` or `if/else` chains checking types/statuses (`arch-smell-shotgun-surgery`).
- **Remedy:** Replace branching with a typed dictionary or polymorphism.
- **Example:**
  ```typescript
  // Instead of: if (type === 'A') ... else if (type === 'B') ...
  const handlers: Record<PaymentType, PaymentStrategy> = {
    CREDIT_CARD: new CreditCardStrategy(),
    VIRTUAL_ACCOUNT: new VirtualAccountStrategy(),
  };
  return handlers[type].process(payload);
  ```

### 2. Separate Orchestration from Pure Domain Logic
- **When to use:** Methods that mix DB queries, external API calls, and business calculations in a single flow.
- **Remedy:** Extract pure calculation into a side-effect-free helper; leave network and DB calls in the orchestration layer.
- **Benefit:** Pure logic can be 100% unit-tested with zero mocks.

### 3. Replace Primitive Obsession with Domain Value Object
- **When to use:** Functions receiving raw strings/numbers that carry business invariants (`email: string`, `amount: number`).
- **Remedy:** Bundle validation and behavior into an immutable value object (`Email`, `Money`).
- **Benefit:** Invalid state becomes unrepresentable at the type level.

### 4. Introduce Transactional Outbox Pattern
- **When to use:** Writing to a database and emitting an event to a message broker (Kafka/RabbitMQ).
- **Remedy:** Write the event into an `outbox_events` table inside the same DB transaction; process outbox via CDC or dedicated background poller.
- **Benefit:** Guarantees at-least-once delivery and eliminates dual-write inconsistency.

### 5. Keyset / Cursor-Based Pagination
- **When to use:** Paginating large database tables where `OFFSET N` forces the database to read and discard $N$ rows.
- **Remedy:** Use `WHERE (created_at, id) < (:last_created_at, :last_id) ORDER BY created_at DESC, id DESC LIMIT 50`.
- **Benefit:** Constant-time pagination performance regardless of table size.

### 6. Decompose Context Provider (Context Split)
- **When to use:** A single React Context Provider holding both frequently updated state (e.g., input values) and static metadata (e.g., user profile).
- **Remedy:** Split into `StateContext` and `DispatchContext`, or isolate local input state using a localized component boundary.
- **Benefit:** Stops cascading full-page re-renders across consumers.

### 7. Introduce Distributed Lock with Fencing Token
- **When to use:** Multiple workers executing critical state mutations concurrently (e.g., wallet deduction, seat booking).
- **Remedy:** Acquire a distributed lock (e.g. Redis Redlock) with a monotonically increasing fencing token passed to the database.
- **Benefit:** Prevents split-brain races and double-spending.
