---
name: lz-change-impact-analysis
description: >
  Conduct proactive blast radius assessment and change impact analysis for database
  schema updates, data record mutations, enum renames, API contract modifications, and
  cross-service dependency changes in enterprise microservices. Use when asked for
  "impact analysis of changing", "blast radius of updating", "breaking change analysis",
  "trace downstream dependencies of a change", "what will break if I change",
  "pre-flight change risk assessment", or "cross-service impact of renaming".
license: MIT
metadata:
  author: lutfi-zain
  version: "1.0"
  research:
    - "Lelovic et al. — Change impact analysis in microservice systems: A systematic literature review (JSS, 2025)"
    - "Cerny et al. — Towards Change Impact Analysis in Microservices-based System Evolution (arXiv:2501.11778, 2025)"
    - "Maule — Impact Analysis of Database Schema Changes (UCL PhD, 2008)"
    - "Xavier et al. — Historical and impact analysis of API breaking changes (SANER 2017)"
    - "Lehnert et al. — Change impact analysis: A systematic mapping study (JSS, 2021)"
---

# Change Impact Analysis

Proactive, multi-tier blast radius assessment for enterprise microservices. Predicts what breaks **before** a change is deployed — across database, backend code, API surface, frontend consumers, and shared middleware.

## When to Use

- "impact analysis of changing this table/column/enum"
- "what will break if I rename/update/delete this field"
- "blast radius of this database update"
- "trace all downstream dependencies of this API change"
- "pre-flight risk assessment for this schema migration"
- "cross-service impact of renaming PaymentMode"
- "which frontends/clients consume this API response field"

## When NOT to Use

- **Post-incident investigation** → Use `lz-kairos-debugger` instead (reactive RCA).
- **Static documentation** → Use `lz-tech-doc-architect` instead (descriptive, not predictive).
- **PR code review** → Use `lz-pr-review` instead (code quality, not blast radius).

## Inputs

- **Change Specification**: The exact change being proposed — SQL statement, enum rename, API field removal, DTO restructure, etc.
- **Target Repository/Service**: The primary service where the change originates.
- **Related Repositories** (optional): Other repos known to consume the service.
- **Database Connection** (optional): Credentials to inspect live schema dependencies.
- **Environment Context** (optional): Which environment (dev/staging/preprod/prod) to validate against.

## Output Structure

The final deliverable is a **Blast Radius Report** containing:

```
# Blast Radius Report: [Change Description]

## 1. Change Classification
## 2. Layer-by-Layer Impact Matrix
## 3. Blast Radius Dependency Graph (Mermaid)
## 4. Risk Severity Summary Table
## 5. Rollout Strategy & Rollback Plan
## 6. Verification Checklist
```

Load `./assets/blast-radius-template.md` for the full template.

## Process

### Phase 1: Change Decomposition

Classify the proposed change into exactly one primary category:

| Category | Examples | Risk Profile |
|----------|----------|--------------|
| **Data Mutation** | `UPDATE ... SET Name = ...`, master data rename | Medium — runtime value change, no schema break |
| **Schema DDL** | `ALTER TABLE ADD/DROP COLUMN`, index change | High — structural break, requires migration |
| **Code Enum** | C# enum rename, new enum value, reorder | High — serialization/deserialization break |
| **API Contract** | Response field rename/remove, status code change | Critical — all consumers affected |
| **Config/Secret** | Connection string, feature flag, env var | Medium — runtime behavior change |

### Phase 2: Database & Data Tier (Layer 1-2)

1. **If DB access is available**: Query `sys.sql_expression_dependencies` (MSSQL) or `pg_depend` (Postgres) to find all objects referencing the changed table/column.
2. **Scan for**:
   - Foreign key constraints referencing the target
   - Stored procedures, views, and computed columns
   - Triggers on the target table
   - Indexes containing the changed column
   - Default values or CHECK constraints using old values
3. **Check data coupling**: Is the value used as a join key, filter condition, or business rule anchor?

### Phase 3: Backend Code & Runtime Tier (Layer 3-4)

1. **Grep the target repo** for all references to the changed entity name (table, column, enum, constant).
2. **Trace the code path**: Controller → Service → Repository → DB Entity.
3. **Classify each reference**:
   - **ID-based** (safe): `WHERE PaymentModeId = 10` — unaffected by name change.
   - **Name-based** (risky): `WHERE Name = 'E-Payment'` — breaks on rename.
   - **Enum serialization**: Check if enum serializes as integer (safe) or string (breaking).
4. **Check DTO/model mapping**: Does the response DTO expose the changed field to consumers?
5. **Check configuration**: Secrets Manager, env vars, appsettings that reference old values.

### Phase 4: API & Endpoint Surface (Layer 5)

1. **Map all endpoints** that return or accept the changed field.
2. **Classify endpoint impact**:
   - **Response-only**: Consumers see new value — visual change, possible string-match break.
   - **Request + Response**: Consumers sending old value will fail validation.
   - **Internal-only**: Only called by other services — narrower blast radius.
3. **Check API versioning**: Is there a versioned endpoint that isolates the change?

### Phase 5: Frontend & Consumer Channels (Layer 6-7)

1. **Map known consumer clients**: Identify all client IDs, apps, and frontends that call affected endpoints.
2. **For each consumer, check**:
   - String comparisons (`===`, `==`, `includes`, `switch/case`) on the changed value.
   - Dropdown/select options, filter logic, display labels derived from the field.
   - TypeScript interfaces/types that mirror the BE DTO.
   - Caching layers (React Query, SWR, localStorage, sessionStorage) that may serve stale data.
3. **Classify consumer impact**: Safe (ID-based), Breaking (string-match), Visual (label-only).

### Phase 6: Shared Middleware & Cross-Service (Layer 8)

1. **Gateway/middleware**: Check if CNDS, API Gateway, or auth middleware inspects the changed field.
2. **Shared libraries**: NuGet packages, npm modules that re-export the affected type.
3. **Event/webhook payloads**: Do async message queues or callback payloads carry the changed field?
4. **Cache layers**: Redis, in-memory caches with TTL that may serve stale values after the change.

### Phase 7: Risk Assessment & Rollout

1. **Build the Blast Radius Summary Table**: For each impacted component, assign severity.
2. **Determine rollout strategy**:
   - **Safe to direct-deploy**: Only ID-based coupling, no string matches, no cache concerns.
   - **Requires Expand-Contract**: Schema DDL changes or multi-service coordination.
   - **Requires synchronized deploy**: FE and BE must deploy together.
3. **Write rollback plan**: Can this change be reverted without data corruption?
4. **Generate verification checklist**: What to test post-deploy, per affected service.

### Phase 8: Compile Report

1. Generate the Blast Radius Report using `./assets/blast-radius-template.md`.
2. Include Mermaid dependency graph showing change propagation path.
3. Present the Risk Severity Summary Table.
4. List verification steps per impacted tier.

## Critical Rules

- **NEVER assume safety**: If a reference cannot be classified as ID-based or Name-based, default to **risky**.
- **NEVER skip the consumer/FE tier**: Backend-only analysis misses the most common production breaks (Xavier et al.: 14.78% of API changes break consumers).
- **NEVER conflate documentation with impact analysis**: This skill is PREDICTIVE (what will break), not DESCRIPTIVE (how it works). Do not produce architecture docs.
- **NEVER skip cache analysis**: Stale cache serving old values is a silent failure mode that manual review consistently misses.
- **ALWAYS classify coupling type**: Every reference must be tagged as ID-based (safe), Name-based (risky), or Unknown (risky).
- **ALWAYS provide rollback assessment**: Every blast radius report must state whether the change is safely reversible.
- **ALWAYS map specific consumers**: Generic "may affect frontends" is not acceptable — name the specific client app, component, or channel.
- **Evidence over assumptions**: If DB access is available, query it. If FE repo is available, grep it. Never guess when you can verify.

## Corrections

_(Empty — populated per-session by lz-session-learn)_

## Learnings

_(Empty — populated per-session by lz-session-learn)_
