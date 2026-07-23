---
name: lz-kairos-debugger
description: >
  Enterprise-grade AWS ECS/CloudWatch root-cause investigation skill. Fuses adaptive RCA
  methodology (5-Whys → Fishbone → Apollo RCA), digital forensics, change analysis, and
  architectural tracing to debug cross-service Kairos (HIS/PAS/PAY) failures, create
  timeline statistics, and generate sequence diagrams. Use when investigating bugs, errors,
  transaction spikes, or system anomalies in AWS ECS microservices.
---

# LZ Kairos Debugger

Investigation, troubleshooting, and root-cause analysis (RCA) skill for AWS ECS microservices architecture, focused on Kairos ecosystem (HIS, PAS, PAY, CNDS).

## When to Use

- Investigating production bugs, error endpoints, or DB transaction spikes
- Anomalous system behavior in AWS ECS services
- Cross-service failures spanning FE → Gateway → Backend → DB
- Creating incident RCA reports with evidence chains
- Building investigation timelines and statistics
- Generating sequence diagrams from traces

---

## ⛔ MANDATORY INVESTIGATION PROTOCOL

**These rules override all other behavior. Violating them means the investigation is incomplete.**

### Rule 1: EXPAND Before Conclude — Never Sample, Always Aggregate

**Anti-pattern:** "From 2 error blocks, the root cause is X" → WRONG.
**Correct:** Extract ALL errors, aggregate stats, THEN conclude.

- Extract minimum 10,000 log events per affected service
- Count unique users, endpoints, clients, error types
- Build complete statistics BEFORE stating root cause
- If sample is small (<100 errors), expand time window until statistically significant

**User had to ask:** *"apakah ribuan request invalid token itu cuma gara-gara satu username?"* → Agent had only sampled 2 blocks.

### Rule 2: Trace to CODE — Every Error Must Have a Code Location

**Anti-pattern:** "Token expired because Keycloak returned 401" → NOT root cause.
**Correct:** Error → Request payload → Code path → Line number → Config source.

For every error found in logs:

1. What is the exact request that triggered it? (decode token/payload)
2. Which code path handles this request? (trace from route handler)
3. What line of code produces this error? (read the actual code)
4. What config/secret does this code path depend on? (trace to source)

**User had to ask:** *"kenapa itu bisa terjadi, berikan saya detailnya, kodenya di mana?"*

### Rule 3: Compare Related Code Paths — Don't Assume They're Identical

**Anti-pattern:** "/login and /login-integration use the same token logic" → WRONG.
**Correct:** Read BOTH code paths side-by-side, diff them, find discrepancies.

When investigating auth/token issues:

- Read `handleLogin()` AND `handleLoginIntegration()` completely
- Diff every field: `is_um`, `token_expirity`, `keycloak_auth_contract`
- Check if different endpoints produce different token structures

**User had to ask:** *"apakah beda?"* (between login and login-integration)

### Rule 4: Trace Config to SOURCE — Never Assume Where Values Come From

**Anti-pattern:** "Token expiry is 7 days from environment variable" → NOT verified.
**Correct:** Read code → find `getTokenExpirity()` → trace to `process.env` → find in Secrets Manager → read actual value → verify unit handling.

For every config value referenced in code:

1. Find the function that reads it (`getXxx()`)
2. Trace to the environment variable or Secrets Manager secret
3. Read the ACTUAL current value (not documentation, not assumptions)
4. Check for unit mismatches (e.g., `"year"` vs `"years"`, `hours` vs `days`)

**User had to ask:** *"7 hari itu didapat dari mana? secret manager?"*

### Rule 5: Change Analysis Is MANDATORY — Run It From Step 1

**Anti-pattern:** "No changes found in 30 days" → INCOMPLETE.
**Correct:** Check ALL of these in parallel from the start:

- [ ] Git commits (last 30 days, focus on last 7)
- [ ] ECS task definition revisions
- [ ] ECR image tags and push timestamps
- [ ] Secrets Manager rotation history (last 30 days)
- [ ] CloudTrail API calls (config changes, IAM changes)
- [ ] RDS parameter changes, maintenance windows
- [ ] Feature flag toggles
- [ ] Autoscaling events

**User had to ask:** *"ya cari tau semua, terutama apakah ada perubahan config / new deployment"*

### Rule 6: NEVER Say "Not Found" — Say "Not Found YET, Here's What I Checked"

**Anti-pattern:** "Tidak ada perubahan config" → User doesn't know if you checked.
**Correct:** List every source you checked, with timestamps of last modification.

```
✅ Checked:
- Git log: last commit June 23 (PR #221)
- Task definition: rev 23, June 23
- ECR: prd-v1.0.34, June 23
- Secrets Manager: last rotated [date]
- CloudTrail: no config changes in 7 days
- RDS: auto_minor_upgrade=false, maintenance Saturday
```

---

## Methodology (Adaptive RCA — Mandatory Sequential)

### Phase 1: Digital Forensics (Evidence First, Assumptions Last)

**CRITICAL RULE: NEVER touch/edit code before investigation completes.**

1. Extract raw logs from CloudWatch using `aws logs filter-log-events` (fallback when Insights blocked by IAM)
2. **Aggregate ALL errors** — minimum 10K events, count unique users/endpoints/clients
3. Capture system state: ECS task definitions, Secrets Manager values, service health
4. Check CloudWatch Investigations (AI-powered) for auto-generated hypotheses

```bash
aws logs filter-log-events \
  --log-group-name "/ecs/<cluster-name>" \
  --filter-pattern '{ $.level = "ERROR" }' \
  --start-time <epoch_ms> --end-time <epoch_ms> \
  --interleaved --max-items 10000 \
  --profile <profile> --region ap-southeast-3
```

### Phase 2: Change Analysis (Parallel Track — MANDATORY)

**Always run alongside Phase 1.** Most production incidents correlate with recent changes.

1. Identify what changed in the last 24-72h: deploys, config edits, DB migrations, feature flags, library updates
2. Join deploy timestamps with error rate inflection points
3. Compare system state BEFORE vs AFTER the suspected change
4. If timing correlation is strong → Change Analysis may be the fastest path to root cause

See `references/change-analysis.md` for detailed methodology.

### Phase 3: Adaptive RCA (Escalate Based on Complexity)

Start with **5 Whys**. Escalate when complexity demands:

```
5 Whys (linear issues)
    ↓ multiple branches emerge
Fishbone (brainstorm categories)
    ↓ evidence conflicts or multi-factor
Apollo RCA (evidence-based cause-effect mapping)
    ↓ safety-critical or cascading failure
Fault Tree Analysis (boolean logic gates)
```

**When to escalate rules:**

- Multiple equally plausible "why" branches → Fishbone
- Can't validate each "why" with objective evidence → Apollo RCA
- Problem spans multiple teams/services with interrelated causes → FTA
- High business/risk impact requiring formal rigor → Full Apollo with RealityCharting

See `references/rca-methodologies.md` for complete method comparison.

### Phase 4: Cross-Service Architectural Tracing

1. Find unique request ID from entry-point logs (Gateway/CNDS)
2. Trace same request ID downstream: FE → Gateway → Middleware → Backend ECS → DB
3. **Read the actual code** that handles the request — not just logs, but the source
4. Check `Secrets Manager` for runtime config — **read the actual value**, never assume
5. **Compare related code paths** (e.g., /login vs /login-integration) for discrepancies
6. Correlate X-Ray/OTel traces if available, or manually reconstruct from CloudWatch logs per service

### Phase 5: Timeline & Statistics Construction

Reconstruct incident timeline second-by-second using:

- CloudWatch log timestamps across all affected services
- ECS lifecycle events (task state changes, deployments)
- CloudTrail API calls
- Error rate metrics (aggregated from Phase 1 Python analysis)

**Statistics must include:**

- Total unique users affected
- Total error events per time window
- Error breakdown by endpoint, client, hospital
- Top N most affected users with their error counts

See `references/sre-postmortem.md` for timeline best practices.

### Phase 6: Visual Sequence Generation

Generate Mermaid sequence diagrams and Gantt trace waterfalls from investigation data. See `assets/rca-template.md` for templates with `dateFormat: x` (milliseconds) for trace visualization.

## Kairos-Specific Gotchas

- **HIS containers** (`his-*-iac`) lack SSM agent — `execute-command` fails with `TargetNotConnectedException`. Use CloudWatch logs only.
- **Secrets Manager** loads config at runtime via `SecretStorage.syncSecret()`. Never assume pool sizes, timeouts, or credentials from source code defaults.
- **CNDS signature validation**: Check `Console.WriteLine(signature)` in C# CloudWatch logs. Common mismatch: leading zero (e.g., `0E78...` vs `E78...`).
- **UAT vs Local Proxy**: They route to different backends. Test both when debugging signature/integration issues.
- **Login vs Login-Integration**: These produce DIFFERENT token structures (`is_um`, `token_expirity`). Always diff both code paths when investigating auth issues.
- **Secrets Manager unit typos**: Check for `"year"` vs `"years"`, `"hour"` vs `"hours"` — code may fallback to different defaults on mismatch.

## References

- `references/rca-methodologies.md` — Complete RCA method comparison and selection guide
- `references/change-analysis.md` — Change Analysis methodology for deploy-correlated incidents
- `references/sre-postmortem.md` — SRE blameless postmortem and timeline construction
- `references/investigation-playbook.md` — AWS ECS/CloudWatch technical patterns
- `assets/rca-template.md` — Enterprise RCA report template

## Execution Checklist

Before presenting ANY findings to user, verify ALL boxes checked:

- [ ] Minimum 10K log events extracted and aggregated
- [ ] Unique users/endpoints/clients counted
- [ ] Every error traced to code location (file + line)
- [ ] Every config value traced to Secrets Manager source
- [ ] Related code paths compared (not assumed identical)
- [ ] Change Analysis completed (git, ECS, ECR, Secrets Manager, CloudTrail)
- [ ] Statistics table built (per user, per endpoint, per client)
- [ ] Timeline constructed with timestamps from all sources
