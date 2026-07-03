# PR Review Anti-Patterns — What NOT to Do

Extracted from real-world PR review failures across Google, Sentry, and open-source projects.
This file is loaded when the reviewer detects it might be falling into an anti-pattern.

## Anti-Pattern 1: The Rubber Stamp

**What it looks like:**
> "LGTM! 👍"

**Why it's harmful:**
- Provides no value to the author
- Misses opportunity to share knowledge
- Reduces trust in the review process
- Often leads to production incidents

**Correction:** Even if the code is genuinely good, mention at least one specific thing
you verified or appreciated. "LGTM — I verified the error handling in the new auth flow
covers both 401 and 403 cases correctly."

---

## Anti-Pattern 2: The Novel

**What it looks like:**
- 50+ comments on a single PR
- Multi-paragraph explanations for each finding
- Re-architecting the solution in review comments

**Why it's harmful:**
- Overwhelms the author → they ignore most comments
- Signals that the design phase was skipped
- Mixes critical issues with style preferences

**Correction:** If you have >15 findings, escalate the top 3-5 as BLOCKING and create a
follow-up issue/ticket for the rest. Separate the "must fix now" from "consider for later."

---

## Anti-Pattern 3: The Gatekeeper

**What it looks like:**
- Blocking on style preferences
- Requiring rewrites that don't change behavior
- "I would have done it differently" → REQUEST_CHANGES

**Why it's harmful:**
- Creates bottleneck in the review process
- Demoralizes authors
- Confuses "better" with "necessary"

**Correction:** If a pattern is functional and follows project conventions, it ships.
Use NIT for style preferences. Only block on correctness, security, or significant
performance issues.

---

## Anti-Pattern 4: The Time Bomb

**What it looks like:**
- Approving quickly without reading the diff
- Reviewing only the file names, not the actual changes
- "I trust the author" → immediate approve

**Why it's harmful:**
- This is how production incidents happen
- The reviewer's name is on the approval → shared accountability
- "I didn't actually look at it" is not a defense

**Correction:** Always read the diff. For large PRs, at least read the critical path
changes (auth, payment, data mutation, schema changes).

---

## Anti-Pattern 5: The Ghost

**What it looks like:**
- Taking 3+ days to review without communication
- Leaving comments without a final verdict (APPROVE/REQUEST_CHANGES)
- Starting a review, adding 2 comments, then disappearing

**Why it's harmful:**
- Blocks the author and downstream work
- Creates uncertainty about PR status
- Erodes team trust

**Correction:** Set a response time expectation. If you can't review within 24h, say so.
Always end with a clear verdict. "I'll need more time to review the database changes,
but the API layer looks good. Partial approval for the controller changes."

---

## Anti-Pattern 6: The False Positive Factory

**What it looks like:**
- Flagging imaginary issues
- "This MIGHT cause a race condition" without evidence
- Creating findings to justify the review's existence

**Why it's harmful:**
- Wastes the author's time
- Creates review fatigue → future real findings get ignored
- Signals insecurity, not expertise

**Correction:** Every finding must be evidence-based. If you suspect an issue but aren't
sure, label it as a QUESTION: "Could this be accessed concurrently? If yes, the shared
state on line 42 needs synchronization."

---

## Anti-Pattern 7: The Performative Agreement

**Source:** getsentry/skills code-review (Sentry engineering practices)

**What it looks like:**
- "You're absolutely right!"
- "Great point, I'll fix that right away!"
- Immediately implementing every suggestion without evaluation

**Why it's harmful:**
- Not all review feedback is correct
- Blind agreement creates bad code just as much as no review
- Reverses the burden of proof

**Correction from Sentry's pattern:**
```
READ → UNDERSTAND → VERIFY → EVALUATE → RESPOND → IMPLEMENT
```
Before agreeing, verify: Is the suggestion actually better? Does it apply to this context?
Use YAGNI check: grep for actual usage before implementing a requested abstraction.

---

## Anti-Pattern 8: The Scope Creep

**What it looks like:**
- "While you're at it, could you also..."
- Requesting unrelated improvements in the review
- Treating the PR as an opportunity to refactor the entire module

**Why it's harmful:**
- Increases PR scope → harder to review → delays merge
- Mixes unrelated changes → harder to revert
- Demoralizes the author ("I thought I was done")

**Correction:** If you spot something worth improving that's outside the PR scope,
create a separate issue or ticket. Comment: "Not blocking: I noticed [X] could be
improved — I'll create a follow-up issue."
