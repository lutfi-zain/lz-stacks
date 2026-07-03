# Severity Classification Guide

Detailed guide for consistently classifying PR review findings.
Referenced during Phase 4-5 of the lz-pr-review workflow.

## Decision Tree

```
Is this a security vulnerability?
├── YES → 🔴 BLOCKING
│
Will this cause data loss or production downtime?
├── YES → 🔴 BLOCKING
│
Will this cause incorrect behavior for end users?
├── YES, and it affects all users → 🔴 BLOCKING
├── YES, but only edge cases → 🟠 IMPORTANT
│
Does this introduce a performance regression?
├── YES, >10x slower on hot path → 🔴 BLOCKING
├── YES, measurable but not critical → 🟠 IMPORTANT
├── Possible but unverified → 🟡 SUGGESTION
│
Does this violate backwards compatibility?
├── YES, public API breaking change → 🔴 BLOCKING
├── YES, internal API change → 🟠 IMPORTANT
│
Is this a missing test?
├── For new business logic → 🟠 IMPORTANT
├── For existing unchanged logic → 🟡 SUGGESTION
│
Is this a code quality issue?
├── Significantly hurts maintainability → 🟠 IMPORTANT
├── Minor readability improvement → 🟡 SUGGESTION
├── Style/formatting preference → 🔵 NIT
│
Is this unclear to the reviewer?
├── Need author explanation to evaluate → ⚪ QUESTION
```

## Severity Definitions

### 🔴 BLOCKING
**Must fix before merge. Non-negotiable.**

Criteria (ANY one is sufficient):
- Security vulnerability (injection, auth bypass, data leak)
- Data corruption or loss risk
- Production crash potential
- Broken backwards compatibility on public APIs
- Compliance violation (GDPR, HIPAA, PCI)
- Missing critical error handling that could cascade

Examples:
- SQL injection via string interpolation
- Unbounded retry loop without backoff
- Password stored in plaintext
- Race condition on financial transaction
- Missing null check on deserialized user input

### 🟠 IMPORTANT
**Should fix before merge. Exceptions require documented justification.**

Criteria:
- Significant performance regression (>2x on measured path)
- Missing tests for new business logic
- Error handling that could confuse users
- Technical debt that will compound quickly
- Logic that works but is brittle

Examples:
- N+1 query pattern in a list endpoint
- New API endpoint without authentication check
- Error message that leaks internal details
- Catch block that swallows exception without logging

### 🟡 SUGGESTION
**Improvement opportunity. Author may accept or decline with reason.**

Criteria:
- Better approach exists but current works correctly
- Minor performance optimization
- Readability improvement
- Pattern inconsistency with codebase conventions

Examples:
- Using `Array.reduce` where `for...of` is more readable
- Variable name could be more descriptive
- Function could be extracted to reduce nesting
- Comment explaining "why" would help future readers

### 🔵 NIT
**Style preference. Author's call.**

Criteria:
- Formatting (if no auto-formatter is configured)
- Import ordering
- Blank line placement
- Minor wording in comments/documentation

Examples:
- Single quotes vs double quotes (when not enforced)
- Trailing comma preference
- `const` vs `let` when variable is never reassigned
- Log level choice (debug vs info)

### ⚪ QUESTION
**Not a finding — needs clarification to evaluate.**

Criteria:
- Reviewer doesn't understand the intent
- Code behavior seems unexpected but might be intentional
- Domain knowledge gap prevents evaluation
- Testing approach is unclear

Examples:
- "Is this timeout value based on SLA requirements?"
- "Is the sort order here intentional? It differs from the other endpoint."
- "This looks like it handles the error twice — is that by design?"
- "Are there existing tests that cover this path that I'm missing?"

## Escalation Rules

1. If you have **≥1 BLOCKING** finding → verdict must be `REQUEST_CHANGES`
2. If you have **≥3 IMPORTANT** findings with no BLOCKING → verdict should be `REQUEST_CHANGES`
3. If you have **1-2 IMPORTANT** findings only → verdict can be `APPROVE` with conditions
4. If you have only **SUGGESTION + NIT** findings → verdict is `APPROVE`
5. If you have only **QUESTION** findings → verdict is `COMMENT` (pending clarification)

## Special Cases

### Draft PRs
- Focus on architectural direction, not code quality
- Findings should be mostly QUESTION and SUGGESTION
- No BLOCKING findings unless the direction is fundamentally wrong

### Hotfix PRs
- Focus exclusively on: correctness, no regressions, minimal blast radius
- Relax: test coverage requirements, code style
- Still flag: security issues, data corruption risks

### Dependency Update PRs
- Check: breaking changes in changelog, CVE fixes, major version bumps
- Verify: lock file updated, no ghost dependencies
- Flag: major version bump without migration plan
