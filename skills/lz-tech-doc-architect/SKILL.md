---
name: lz-tech-doc-architect
description: >
  Enterprise-grade Technical Writer skill for generating System Architecture, Component Design (FE/BE),
  Event-Driven flows, and API Endpoint documentation. Features cross-service integration tracing,
  interactive depth confirmation, and comprehensive Mermaid diagrams. Use when asked to
  "document this architecture", "map the component interactions", or "trace this cross-service endpoint".
license: MIT
---

# Technical Documentation Architect

An enterprise-standard technical writing and architecture mapping skill. It translates code, systems, and conversations into structured documentation, avoiding assumptions and adhering to strict visual best practices.

## When to Use

- "write technical documentation for this feature"
- "map the frontend component interactions"
- "trace the event-driven pub/sub flow"
- "create an architecture design document"
- "document this API endpoint and trace its downstream connections"
- "explain how these microservices communicate"

## Inputs

- **Target Domain**: What needs documenting (e.g., specific React component, specific API endpoint, complete login flow, event bus topic).
- **Doc Type**: `--type=architecture` | `--type=component` | `--type=endpoint` | `--type=event`
- **Depth Level**: `--depth=quick` (high-level summary + full chain diagram) or `--depth=detailed` (code-level tracing across ALL chained services).

## Process

### Phase 1: Initial Discovery (Cross-Service Boundary)
1. Trace the primary endpoint. Identify its Controller, Service, and Repository.
2. Identify **ALL** downstream integrations (e.g., HTTP calls to other microservices, gRPC calls, Event emissions).

### Phase 2: Interactive Gate (CRITICAL)
If downstream integrations are found (e.g., Service A hits Service B and Service C):
1. **PAUSE AND ASK THE USER**: List the discovered downstream integrations.
2. Ask: *"I found connections to endpoints [X, Y, Z]. Which of these downstream services should I trace deeply?"*
3. Wait for the user's response before proceeding.

### Phase 3: Deep Data Tracing (Iterative)
1. For every approved downstream endpoint in the chain, trace its internal logic until the chain terminates (e.g., final DB insert or external 3rd party call).
2. **Never stop at the Controller level.** You MUST read and trace the data flow through:
   - **DTOs / Validators**: What exact schema is expected?
   - **Business Logic / Services**: What conditional rules apply?
   - **Helpers / Utils**: How is data transformed (e.g., mapping, hashing, date parsing)?
   - **Repositories / ORM**: What specific database calls are made?

### Phase 4: Documentation Generation
Select the correct template and adapt it based on the `--type`:
- **Architecture**: Focus on C4 context, high-level microservices/system interaction, and domain boundaries.
- **Component**: Focus on Frontend (React/Angular/Astro) component trees, state management, props, and API calls.
- **Endpoint**: 
  - If `--depth=quick`: Provide a high-level summary of the FULL chain (e.g., FE -> Payment -> Insert DB -> Inventory -> Insert DB). Do not dump code snippets, just explain the end-to-end journey and draw the full sequence diagram.
  - If `--depth=detailed`: Document the deep internals of EVERY service in the chain. Group the documentation by service (e.g., Section 2: Payment Service Internals, Section 3: Inventory Service Internals).
- **Event**: Focus on producers, message brokers, topics, consumers, and idempotency handling.

### Phase 5: Visual Aids (Mermaid)
Apply the rules in `./references/mermaid-best-practices.md` to generate syntax-safe diagrams:
- `graph TD` for C4 Context and Component Trees.
- `sequenceDiagram` for Request/Event Lifecycles (must include internal service layers and cross-service HTTP calls).
- `erDiagram` for Database schemas.

## Critical Rules

- **Interactive Tracing**: Never silently ignore downstream calls. Always ask the user which ones to trace.
- **End-to-End Chain**: Even in `--depth=quick`, the summary and diagrams must show the entire integration chain to the final DB insert, just without the verbose code details.
- **Data Transformations**: Always document how data changes shape across the chain.
