# Severity Classification Guide (`severity-guide.md`)

Detailed guide for consistently classifying PR review findings. Referenced during Phase 4-5 of the `lz-pr-review` workflow.

---

## Decision Flowchart

```mermaid
flowchart TD
    Q1{"Is this a security vulnerability?"}
    Q1 -->|Yes| B1["🔴 BLOCKING"]
    Q1 -->|No| Q2{"Will this cause data loss or downtime?"}

    Q2 -->|Yes| B2["🔴 BLOCKING"]
    Q2 -->|No| Q3{"Will this cause incorrect user behavior?"}

    Q3 -->|All users| B3["🔴 BLOCKING"]
    Q3 -->|Edge case only| I1["🟠 IMPORTANT"]
    Q3 -->|No| Q4{"Performance regression?"}

    Q4 -->|Major hot-path regression| B4["🔴 BLOCKING"]
    Q4 -->|Noticeable degradation| I2["🟠 IMPORTANT"]
    Q4 -->|Unverified suspicion| S1["🟡 SUGGESTION"]
    Q4 -->|No| Q5{"Violates backwards compatibility?"}

    Q5 -->|Public API breaking| B5["🔴 BLOCKING"]
    Q5 -->|Internal contract change| I3["🟠 IMPORTANT"]
    Q5 -->|No| Q6{"Is this a missing test?"}

    Q6 -->|New business logic| I4["🟠 IMPORTANT"]
    Q6 -->|Existing unchanged logic| S2["🟡 SUGGESTION"]
    Q6 -->|No| Q7{"Code maintainability issue?"}

    Q7 -->|Substantial tech debt| I5["🟠 IMPORTANT"]
    Q7 -->|Minor readability improvement| S3["🟡 SUGGESTION"]
    Q7 -->|Style or formatting preference| N1["🔵 NIT"]
    Q7 -->|No / Unclear intent| Q8["⚪ QUESTION"]

    style B1 fill:#ffebee,stroke:#c62828,color:#000
    style B2 fill:#ffebee,stroke:#c62828,color:#000
    style B3 fill:#ffebee,stroke:#c62828,color:#000
    style B4 fill:#ffebee,stroke:#c62828,color:#000
    style B5 fill:#ffebee,stroke:#c62828,color:#000
    style I1 fill:#fff3e0,stroke:#ef6c00,color:#000
    style I2 fill:#fff3e0,stroke:#ef6c00,color:#000
    style I3 fill:#fff3e0,stroke:#ef6c00,color:#000
    style I4 fill:#fff3e0,stroke:#ef6c00,color:#000
    style I5 fill:#fff3e0,stroke:#ef6c00,color:#000
    style S1 fill:#fffde7,stroke:#fbc02d,color:#000
    style S2 fill:#fffde7,stroke:#fbc02d,color:#000
    style S3 fill:#fffde7,stroke:#fbc02d,color:#000
    style N1 fill:#e3f2fd,stroke:#1976d2,color:#000
    style Q8 fill:#f5f5f5,stroke:#616161,color:#000
```

---

## Severity Definitions

### 🔴 BLOCKING
**Must fix before merge. Non-negotiable.**

Criteria (ANY one is sufficient):
- Security vulnerability (IDOR, SQL injection, SSRF, auth bypass, data leak)
- Data corruption, data loss, or unrecoverable state
- Production crash potential or connection pool starvation
- Broken backwards compatibility on public APIs or unmigrated DB columns
- Compliance violation (GDPR, HIPAA, PCI-DSS, secret exposure)
- Unbounded loops or missing timeouts on external service dependencies

### 🟠 IMPORTANT
**Should fix before merge. Exceptions require documented justification.**

Criteria:
- Significant performance regression (N+1 queries, unindexed foreign keys)
- Missing tests for new business logic
- Error handling that swallows root cause or leaks internal stack traces
- Cascading re-renders or uncleaned memory subscriptions in UI
- Technical debt that will compound quickly or violates clean boundaries

### 🟡 SUGGESTION
**Improvement opportunity. Author may accept or decline with reason.**

Criteria:
- Better architectural approach exists but current implementation is functionally safe
- Readability or simplification opportunity (applying named Structural Remedy)
- Pattern inconsistency with codebase conventions

### 🔵 NIT
**Style preference. Author's call.**

Criteria:
- Formatting preference (when not auto-enforced by linter)
- Import ordering
- Minor wording suggestions in comments or documentation

### ⚪ QUESTION
**Not a finding — needs clarification from author to evaluate.**

Criteria:
- Intent is ambiguous from PR description
- Unclear whether an apparent edge-case is mitigated upstream
- Needs confirmation on SLA or domain requirement

---

## Escalation Rules

1. If you have **$\ge$ 1 BLOCKING** finding $\rightarrow$ Verdict: `REQUEST_CHANGES`
2. If you have **$\ge$ 3 IMPORTANT** findings with no BLOCKING $\rightarrow$ Verdict: `REQUEST_CHANGES`
3. If you have **1-2 IMPORTANT** findings only $\rightarrow$ Verdict: `APPROVE` with conditional comments
4. If you have only **SUGGESTION + NIT** findings $\rightarrow$ Verdict: `APPROVE`
5. If you have only **QUESTION** findings $\rightarrow$ Verdict: `COMMENT` (pending clarification)
