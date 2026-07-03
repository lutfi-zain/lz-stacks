# Clarification Questions Template

Use this template during the Clarification Gate (between Phase 4 and Phase 5).
Adapt the questions based on what you found in Phases 1-4.

## Question Bank by Category

### Intent & Business Context
- What business problem does this PR solve? (if not clear from the description)
- Is there a Jira/Linear ticket with acceptance criteria I should validate against?
- Who are the end users affected by this change?
- Is this change behind a feature flag? If so, what's the rollout plan?
- Are there any compliance or regulatory implications?

### Requirements & Acceptance Criteria
- What does "done" look like for this PR?
- Are there specific edge cases the PM/PO wants tested?
- Does this need to work with [specific browser/device/OS]?
- Are there performance SLAs this change must meet?
- Is backward compatibility required with [specific version/API]?

### Implementation & Design
- Why was [specific pattern] chosen over [alternative]? (ask only if the choice is non-obvious)
- Is the [new abstraction/class/module] expected to be reused elsewhere?
- I see [code pattern] on line X — is this intentional or accidental?
- This function does [A, B, and C] — would it benefit from being split?
- How does this interact with [existing system/feature] that uses the same [resource]?

### Testing & Verification
- How was this manually tested? (if no automated tests exist)
- Are there integration test environments where this was validated?
- Did you run the existing test suite and see any regressions?
- Is there a load test or performance benchmark for this path?

### Risk & Deployment
- What's the deployment order for this change? (if it touches multiple services)
- Can this be rolled back safely? If not, what's the recovery plan?
- Are there database migrations? Do they need to be deployed separately?
- Is monitoring/alerting in place for the affected code paths?
- What's the blast radius if this change has an unexpected bug?
- Are there dependent PRs that need to merge in a specific order?

## Adaptive Question Selection Rules

### Small PRs (< 100 lines, 1-3 files)
Ask 3-4 questions, focused on:
- Business intent (if unclear)
- One implementation question
- Deployment risk

### Medium PRs (100-500 lines, 4-10 files)
Ask 5-7 questions, including:
- Business intent
- 2-3 implementation questions
- Testing strategy
- Deployment risk

### Large PRs (> 500 lines, 10+ files)
Ask 7-10 questions, covering all categories:
- Business intent
- Requirements completeness
- 3-4 implementation questions
- Testing strategy
- 2-3 deployment/risk questions

### Hotfix PRs
Ask 3 questions maximum:
- What's the production impact right now?
- Is this the minimal fix or a full solution?
- Can this be reverted if it makes things worse?
