# Software Architecture & Modularity Review Reference (`layer-architecture.md`)

**Discipline:** Software Architecture, Clean Boundaries & Code Smells  
**Canonical Sources:** Martin Fowler & Kent Beck (*Refactoring*, 2nd Ed, Ch. 3), Robert C. Martin (SOLID), Addy Osmani  
**Prefix:** `arch-`

---

## Rule Catalog by Impact

### 1. Architectural Boundaries & Coupling (CRITICAL)

#### `arch-boundary-leaky-abstraction`
- **Impact:** CRITICAL
- **Why:** Returning raw ORM database entities directly to API clients leaks internal schema details, password hashes, and causes unintended circular serialization.
- **Incorrect:**
  ```typescript
  // Leaks password hash and DB internal timestamps directly to client
  app.get('/users/:id', async (req, res) => {
    const user = await userRepository.findById(req.params.id);
    res.json(user); // ❌ Raw ORM entity exposed!
  });
  ```
- **Correct:**
  ```typescript
  app.get('/users/:id', async (req, res) => {
    const user = await userRepository.findById(req.params.id);
    res.json(UserResponseDTO.fromDomain(user)); // ✅ Explicit boundary projection
  });
  ```
- **Remedy:** Introduce Data Transfer Objects (DTO) or boundary serialization mappers.

#### `arch-coupling-circular-dependency`
- **Impact:** HIGH
- **Why:** Circular module dependencies (`A -> B -> A`) cause module loading deadlocks, runtime `undefined` exports, and prevent unit test isolation.
- **Incorrect:**
  ```typescript
  // OrderService imports UserService; UserService imports OrderService
  ```
- **Correct:**
  ```typescript
  // Introduce domain event or common interface package
  // OrderService -> OrderEventsInterface <- UserService
  ```
- **Remedy:** Apply Dependency Inversion (IoC) or emit domain events.

---

### 2. Martin Fowler Code Smells Baseline (HIGH)

#### `arch-smell-god-component`
- **Impact:** HIGH
- **Why:** Modules or components exceeding 500 lines that mix network I/O, business rules, validation, and rendering become impossible to test and maintain.
- **Incorrect:**
  ```typescript
  class OrderManager {
    // 1200 lines: validates cart, calculates taxes, runs SQL queries,
    // sends Stripe requests, builds PDF receipts, and sends emails!
  }
  ```
- **Correct:**
  ```typescript
  // Decompose into single-responsibility collaborators:
  // TaxCalculator, PaymentProcessor, ReceiptGenerator, OrderRepository
  ```
- **Remedy:** Extract Collaborators; separate orchestration from business logic.

#### `arch-smell-primitive-obsession`
- **Impact:** MEDIUM-HIGH
- **Why:** Using raw `string` or `number` for domain concepts with invariants (Email, Currency, PhoneNumber, NationalID) scatters validation logic across callers.
- **Incorrect:**
  ```typescript
  function transfer(fromIban: string, toIban: string, amount: number) {
    // IBAN format validation repeated across 15 different controllers!
  }
  ```
- **Correct:**
  ```typescript
  // Encapsulate in Value Object with self-validation
  class IBAN {
    constructor(private readonly value: string) {
      if (!isValidIBAN(value)) throw new InvalidIBANException(value);
    }
  }
  function transfer(from: IBAN, to: IBAN, amount: Money) {}
  ```
- **Remedy:** Replace Primitive with Value Object.

#### `arch-smell-feature-envy`
- **Impact:** MEDIUM-HIGH
- **Why:** A method in Service A that calls 6 getters on Object B to compute a value belongs on Object B itself.
- **Incorrect:**
  ```typescript
  class OrderService {
    calculateDiscount(customer: Customer): number {
      if (customer.getTier() === 'VIP' && customer.getPoints() > 1000) {
        return customer.getBaseRate() * 0.2;
      }
      return 0;
    }
  }
  ```
- **Correct:**
  ```typescript
  // Move logic to the data owner
  class Customer {
    calculateDiscount(): number {
      if (this.tier === 'VIP' && this.points > 1000) return this.baseRate * 0.2;
      return 0;
    }
  }
  ```
- **Remedy:** Move Method to the data owning class.

#### `arch-smell-shotgun-surgery`
- **Impact:** HIGH
- **Why:** A single change (e.g. adding a new user role) requires touching 15 different `switch` cases across 15 different files.
- **Incorrect:**
  ```typescript
  // switch(role) statements copied in auth.ts, navigation.ts, profile.ts, api.ts
  ```
- **Correct:**
  ```typescript
  // Replace conditional with polymorphism or a centralized role policy map
  ```
- **Remedy:** Replace Conditional with Strategy / Polymorphism.
