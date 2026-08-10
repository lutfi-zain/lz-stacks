# System Architecture Design (SAD)

**System / Domain:** `[Domain Name]`
**Version:** `1.0`
**Architect/Owner:** `[Team/Owner Name]`

---

## 1. System Context (C4 Level 1)

*High-level view of users, our system boundary, and external systems.*

```mermaid
graph TD
    User["End User (Persona)"] --> System["[Our Core System]"]
    Admin["Admin User"] --> System
    
    subgraph "Our Internal Domain Boundary"
        System
    end
    
    System --> Ext1["[External Payment Gateway (Stripe)]"]
    System --> Ext2["[External Auth Provider (Auth0)]"]
```

---

## 2. Container Architecture (C4 Level 2)

*Major deployable units, tech stacks, and network communications.*

```mermaid
graph TD
    %% Frontend
    WebApp["Web Application (React/Vite)"]
    MobileApp["Mobile App (Flutter)"]
    
    %% API / Gateway
    API["API Gateway / BFF (Kong/Nginx)"]
    
    %% Microservices
    MicroA["Service A (Node.js/NestJS)"]
    MicroB["Service B (Go)"]
    
    %% Storage & Queues
    DB_A[(PostgreSQL - Service A)]
    DB_B[(MongoDB - Service B)]
    Kafka((Event Bus - Kafka))

    %% Connections
    WebApp -->|"HTTPS/JSON"| API
    MobileApp -->|"HTTPS/JSON"| API
    
    API -->|"gRPC/HTTPS"| MicroA
    API -->|"gRPC/HTTPS"| MicroB
    
    MicroA -->|"TCP"| DB_A
    MicroB -->|"TCP"| DB_B
    
    MicroA -.->|"Publishes Event"| Kafka
    Kafka -.->|"Consumes Event"| MicroB
```

---

## 3. Technology Stack & Data Contracts

### A. Tech Stack
| Component | Technology | Responsibility |
| :--- | :--- | :--- |
| **Frontend** | `[e.g., Next.js]` | `[e.g., SSR, Routing, UI]` |
| **Backend A** | `[e.g., Go]` | `[e.g., High-throughput payment processing]` |
| **Database A** | `[e.g., PostgreSQL]` | `[e.g., Relational ACID compliance]` |

### B. Inter-Service Communication
- **Synchronous**: `[e.g., REST API over HTTPS for User Profiles]`
- **Asynchronous**: `[e.g., Kafka Topics for Order Fulfillment]`

---

## 4. Architecture Decision Records (ADRs)

*For `--depth=detailed`: Document key engineering decisions.*

### Decision 1: `[e.g., Using MongoDB instead of Postgres for Service B]`
- **Status**: `[Accepted]`
- **Context**: `[Service B deals with highly unstructured product metadata coming from 3rd party vendors.]`
- **Decision**: `[Adopt MongoDB for schema flexibility.]`
- **Consequences**: 
  - *Pros*: Faster iteration on product schemas.
  - *Cons*: Cannot do complex cross-collection joins easily.
