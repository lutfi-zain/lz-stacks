# Role-Specific Playbooks

Prescriptive checklists for each senior engineering role when conducting change impact analysis. Load this reference when the agent needs to tailor its analysis to a specific stakeholder perspective.

---

## Senior DBA — "The Schema Guardian"

**Primary Concern**: Data integrity, backward compatibility, zero-downtime migrations.

### Pre-Change Checklist

1. **Dependency scan**: Query `sys.sql_expression_dependencies` (MSSQL) or `pg_depend` (Postgres).
2. **FK/trigger/constraint audit**: Check `INFORMATION_SCHEMA` for cascading effects.
3. **Stored procedure impact**: Search proc text for affected table/column names.
4. **View & computed column check**: Identify views referencing changed objects.
5. **Index impact**: Check if changed columns are indexed or in covering indexes.
6. **Data migration script**: Write idempotent, rollback-safe migration.
7. **Backward compatibility window**: Define how long old schema remains valid.

### MSSQL Dependency Query Template

```sql
-- Find all objects referencing a specific table
SELECT
    referencing_schema = SCHEMA_NAME(o.schema_id),
    referencing_object = o.name,
    referencing_type = o.type_desc,
    referenced_schema = d.referenced_schema_name,
    referenced_object = d.referenced_entity_name,
    referenced_column = d.referenced_minor_name
FROM sys.sql_expression_dependencies d
JOIN sys.objects o ON d.referencing_id = o.object_id
WHERE d.referenced_entity_name = '<TABLE_NAME>'
ORDER BY o.type_desc, o.name;
```

### PostgreSQL Dependency Query Template

```sql
-- Find all objects depending on a specific table
SELECT
    dependent_ns.nspname AS dependent_schema,
    dependent.relname AS dependent_object,
    source_ns.nspname AS source_schema,
    source.relname AS source_object
FROM pg_depend
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid
JOIN pg_class dependent ON pg_rewrite.ev_class = dependent.oid
JOIN pg_class source ON pg_depend.refobjid = source.oid
JOIN pg_namespace dependent_ns ON dependent.relnamespace = dependent_ns.oid
JOIN pg_namespace source_ns ON source.relnamespace = source_ns.oid
WHERE source.relname = '<TABLE_NAME>'
AND dependent.relname != source.relname;
```

### Rollback Safety Scoring

| Change Type | Rollback Risk | Rationale |
|-------------|--------------|-----------|
| Data UPDATE (rename value) | 🟢 Low | Reverse UPDATE restores old value |
| ALTER ADD COLUMN | 🟢 Low | DROP COLUMN reverses it |
| ALTER DROP COLUMN | 🔴 High | Data lost permanently |
| ALTER MODIFY TYPE | 🟡 Medium | May lose precision or truncate |
| DROP TABLE | 🔴 Critical | Data lost, cascade effects |
| CREATE INDEX | 🟢 Low | DROP INDEX reverses it |

---

## Senior Backend — "The Contract Enforcer"

**Primary Concern**: API contract stability, DTO/enum consistency, service-to-service call integrity.

### Pre-Change Checklist

1. **Enum serialization check**: Does the enum serialize as integer (safe) or string (breaking)?
2. **DTO field mapping**: Are changed DB fields exposed in response DTOs?
3. **Hardcoded literals**: Grep for string literals matching old values.
4. **Service-to-service calls**: Do other services call endpoints that return the changed field?
5. **Configuration audit**: Check Secrets Manager, appsettings, env vars for old values.
6. **Backward compatibility**: Can old and new values coexist during rollout?

### Enum Coupling Classification

```
ID-BASED COUPLING (Safe):
  var mode = db.PaymentModes.First(m => m.Id == 10);
  // Name change has zero impact — lookup by integer key

NAME-BASED COUPLING (Breaking):
  var mode = db.PaymentModes.First(m => m.Name == "E-Payment");
  // Name change causes runtime failure — query returns null

ENUM-TO-STRING SERIALIZATION (Breaking):
  [JsonConverter(typeof(StringEnumConverter))]
  public PaymentModeId Mode { get; set; }
  // JSON output: "E_Payment" → "Digital_Payment" — consumers break

ENUM-TO-INT SERIALIZATION (Safe):
  public PaymentModeId Mode { get; set; }
  // JSON output: 10 → 10 — consumers unaffected
```

### API Versioning Decision Tree

- Only ID-based coupling → Direct deploy, no versioning needed.
- Name exposed in response only → Deploy BE first, monitor FE.
- Name in request validation → Version endpoint (v1 accepts old, v2 accepts new).
- Shared DTO across services → Synchronized deploy with Expand-Contract.

---

## Senior Frontend — "The Consumer Advocate"

**Primary Concern**: API response shape stability, type safety, runtime string matching fragility.

### Pre-Change Checklist

1. **String comparison audit**: Grep for `===`, `==`, `includes()`, `switch/case` on changed values.
2. **Type definition sync**: Check if TypeScript interfaces match new BE response shape.
3. **Dropdown/select options**: Are display labels derived from API Name fields?
4. **Filter logic**: Does any filtering use the changed string value?
5. **Cache invalidation**: React Query `staleTime`, SWR revalidation, localStorage/sessionStorage.
6. **i18n/localization**: Are translated labels tied to API field values?

### Danger Pattern Detection (grep patterns)

```bash
# String comparison on API values
grep -rn "=== ['\"]OLD_VALUE['\"]" src/
grep -rn "== ['\"]OLD_VALUE['\"]" src/
grep -rn "includes(['\"]OLD_VALUE['\"])" src/

# Switch/case on API values
grep -rn "case ['\"]OLD_VALUE['\"]" src/

# Object key matching
grep -rn "\[.OLD_VALUE.\]" src/

# Filter/find on name field
grep -rn "\.name === " src/
grep -rn "\.Name === " src/
```

### Consumer Impact Classification

| Pattern | Impact | Action Required |
|---------|--------|----------------|
| `if (mode.id === 10)` | 🟢 Safe | None |
| `if (mode.name === "E-Payment")` | 🔴 Breaking | Refactor to ID-based |
| `<option>{mode.name}</option>` | 🟡 Visual | Inform UX team |
| `localStorage.getItem("paymentMode")` | 🟡 Stale cache | Clear on deploy |

---

## DevSecOps — "The Pipeline Gatekeeper"

**Primary Concern**: Automated validation in CI/CD, deployment readiness, security implications.

### Pre-Change Checklist

1. **CI gate**: Is there a breaking-change detection gate (oasdiff, Pact can-i-deploy)?
2. **Migration pipeline**: Does the schema migration run as a pipeline stage with rollback?
3. **Deploy sequence**: What order must services deploy? (DB → BE → FE typical)
4. **Feature flag**: Can the change be gated behind a feature flag for gradual rollout?
5. **Monitoring**: Are alerts set for error rate spikes post-deploy?
6. **Rollback automation**: Can the change be rolled back via pipeline, or manual-only?

### ITIL Risk Classification

| Risk Level | Criteria | Approval |
|------------|----------|----------|
| **Standard** | Pre-approved change type, low risk, well-tested | Auto-deploy via CI/CD |
| **Normal** | Cross-service impact, medium risk | CAB review required |
| **Emergency** | Production incident, critical fix | Emergency CAB, expedited |

### Deploy Sequence Template

```
1. [T-30min] Run DB migration (Expand phase) — add new alongside old
2. [T-20min] Deploy Backend services — dual-write to old and new
3. [T-10min] Verify: health checks, error rates, log scan
4. [T-0]     Deploy Frontend — consume new values
5. [T+10min] Monitor: DORA change failure rate
6. [T+24h]   Contract phase — remove old schema elements
7. [T+48h]   Post-Implementation Review
```

---

## Senior Fullstack — "The Bridge Builder"

**Primary Concern**: End-to-end impact tracing across all tiers (DB → BE → API → FE).

### Cross-Tier Impact Matrix

| Tier | Check | Question | Severity if Missed |
|------|-------|----------|--------------------|
| **DB** | Schema/Data deps | Are other tables/views/procs affected? | 🔴 Data corruption |
| **BE** | Enum/DTO mapping | Does code match by ID or Name? | 🔴 Runtime crash |
| **API** | Response shape | Did the response payload structure change? | 🔴 FE breakage |
| **FE** | String matching | Any `=== "old_value"` in JS/TS? | 🔴 Silent logic error |
| **FE** | Cache | Will stale cache serve old value? | 🟡 Temporary inconsistency |
| **Infra** | Config/Secrets | Does runtime config reference old value? | 🔴 Service failure |
| **Cross** | Event/webhook | Do async payloads carry affected field? | 🔴 Integration failure |

### The Fullstack owns the coordination:

1. Produce the blast radius report spanning all tiers.
2. Assign remediation tasks to appropriate role owners.
3. Define deploy sequence and rollback triggers.
4. Run post-deploy verification across all tiers.
