# Extraction Checklist (Pre-Write Verification)

> Use this checklist immediately before any write in `lz-session-learn` Phase 4 (WRITE). It catches the most common skill violations at the gate, not after.

## Per-Item Checks

For each candidate learning row, confirm **all** of the following:

- [ ] **Survives the Ebbinghaus filter** — `S ≥ 2` in the score from `../references/extraction-heuristics.md`.
- [ ] **One line of meaning** — the rule itself fits in ≤ 80 chars.
- [ ] **Imperative voice** — starts with a verb (`Use`, `Never`, `Always`, `Prefer`, `Avoid`).
- [ ] **Evidence citation** — a command, an error code, a `file:line`, or a quoted user phrase.
- [ ] **Date stamp** — ISO `YYYY-MM-DD`, today's date in the project's timezone.
- [ ] **Not a duplicate** — `grep` for the rule's main verb + object across all known targets.
- [ ] **No secrets / PII** — no tokens, API keys, customer names, internal URLs with auth.
- [ ] **Stable** — won't be obsolete in 3 months (no "we *might* do X" speculation).

## Per-Write Checks

For the write operation itself:

- [ ] **Target file was read this session** — never write to a file you haven't read.
- [ ] **Section anchor exists** — `## Learnings`, `## Corrections`, `## Hard Rules`, or the closest existing convention.
- [ ] **Single anchor per file** — if multiple anchors exist, pick the strongest one and merge.
- [ ] **New rows at the top of the section** — recent-first ordering.
- [ ] **No new section invented** — used existing or named the new one `## Learnings`.
- [ ] **No new top-level structure** — did not add new `## Top-Level` headers unrelated to the write.
- [ ] **No full-file rewrite** — used surgical `Edit` (not `Write`).
- [ ] **No contradicting rules** — if a similar rule exists with a different imperative, surface the conflict to the user.

## Post-Write Checks (Phase 5)

After the write:

- [ ] `git diff <target>` shown to the user, or the diff captured in the response.
- [ ] `CLAUDE.md` line count ≤ 300 (or the closest project-specific budget).
- [ ] `MEMORY.md` line count ≤ 200 and ≤ 25KB (Claude Code auto-memory limit).
- [ ] No learning appears in 2+ different files.
- [ ] Updated file was re-read to confirm the write succeeded (cat / Read).
- [ ] The new section is findable via `grep -n '## Learnings' <target>`.
- [ ] Each new row is findable via `grep -nE '^- \*\*[0-9]{4}-' <target>`.

## Red-Flag Triggers (Stop and Ask the User)

If **any** of the following, halt the write and ask the user before proceeding:

- The new content would push the target file past its size budget by > 20%.
- A contradicting rule already exists.
- The target file has been edited more than 5 times in the last 7 days (the user is iterating fast; don't surprise them).
- The evidence citation contains a literal secret-looking string.
- The user previously asked to "stop adding to MEMORY.md" in this session.
- The skill is being run from inside another skill (e.g., `/skill:lz-create-agentsmd` already wrote the file).

## Self-Audit Score

After completing the checklist, score yourself 0–10:

- 10 = all boxes checked, no red flags, diff shown
- 7–9 = minor boxes unchecked, fixable in 1 minute
- 4–6 = multiple unchecked, do not declare success; re-run
- 0–3 = re-read `SKILL.md` from scratch

Print the score in your response. If < 7, the user should re-invoke the skill.

## How This File Is Used by the Agent

The agent should not re-read this file on every run. It is loaded on demand by the agent in Phase 4 when it needs the checklist. The full workflow is in `../SKILL.md`.
