# Extraction Checklist (Pre-Write Verification)

> Use this checklist immediately before any write in `lz-session-learn` Phase 4 (WRITE). It catches the most common skill violations at the gate, not after.
> **Check mode-specific items too** — items marked `[K]` are Knowledge Mode only, `[B]` are Behavioral Mode only.

## Per-Item Checks

For each candidate learning row, confirm **all** of the following:

- [ ] **Survives the retention filter** — `S ≥ 2` (Knowledge) or `S_b ≥ 2` (Behavioral) from `../references/extraction-heuristics.md`.
- [ ] **Correct section for the mode**:
  - `[K]` Writing to `## Learnings`, `## Corrections`, or `## Hard Rules`
  - `[B]` Writing to `## Behavioral Patterns`
- [ ] **Correct format for the mode**:
  - `[K]` One line of meaning, imperative voice, evidence citation
  - `[B]` Trigger-first ("When [scenario]:"), rationale included, retry count if applicable
- [ ] **Evidence citation** — a command, an error code, a `file:line`, or a quoted user phrase.
- [ ] **Date stamp** — ISO `YYYY-MM-DD`, today's date in the project's timezone.
- [ ] **Not a duplicate** — `grep` for the rule's main verb + object across all known targets.
- [ ] **No secrets / PII** — no tokens, API keys, customer names, internal URLs with auth.
- [ ] **Stable** — won't be obsolete in 3 months (no "we *might* do X" speculation).
- [ ] `[B]` **Not a project fact masquerading as behavior** — if the row reads "Use X not Y" without a scenario trigger, it probably belongs in Knowledge Mode.
- [ ] `[B]` **Retry compression verified** — did the session actually show N attempts before success? Or is this a one-shot guess?

## Per-Write Checks

For the write operation itself:

- [ ] **Target file was read this session** — never write to a file you haven't read.
- [ ] **Section anchor matches the mode**:
  - `[K]` `## Learnings`, `## Corrections`, `## Hard Rules`, or closest convention
  - `[B]` `## Behavioral Patterns` (existing or newly created)
- [ ] **Single anchor per file per mode** — if multiple anchors exist, pick the strongest one.
- [ ] **New rows at the top of the section** — recent-first ordering.
- [ ] **No new section invented** — used existing or named `## Learnings` (Knowledge) or `## Behavioral Patterns` (Behavioral).
- [ ] **No new top-level structure** — did not add new `## Top-Level` headers unrelated to the write.
- [ ] **No full-file rewrite** — used surgical `Edit` (not `Write`).
- [ ] **No contradicting rules** — if a similar rule exists with a different imperative, surface the conflict to the user.
- [ ] `[B]` **Not mixing modes** — behavioral rows in `## Behavioral Patterns`, not in `## Learnings`.

## Post-Write Checks (Phase 5)

After the write:

- [ ] `git diff <target>` shown to the user, or the diff captured in the response.
- [ ] `CLAUDE.md` line count ≤ 300 (or the closest project-specific budget).
- [ ] `MEMORY.md` line count ≤ 200 and ≤ 25KB (Claude Code auto-memory limit).
- [ ] No learning appears in 2+ different files.
- [ ] Updated file was re-read to confirm the write succeeded (cat / Read).
- [ ] `[K]` Section findable via `grep -n '## Learnings' <target>`.
- [ ] `[B]` Section findable via `grep -n '## Behavioral Patterns' <target>`.
- [ ] Each new row is findable via `grep -nE '^- \*\*[0-9]{4}-' <target>`.

## Red-Flag Triggers (Stop and Ask the User)

If **any** of the following, halt the write and ask the user before proceeding:

- The new content would push the target file past its size budget by > 20%.
- A contradicting rule already exists.
- The target file has been edited more than 5 times in the last 7 days (the user is iterating fast; don't surprise them).
- The evidence citation contains a literal secret-looking string.
- The user previously asked to "stop adding to MEMORY.md" in this session.
- The skill is being run from inside another skill (e.g., `/skill:lz-create-agentsmd` already wrote the file).
- `[B]` A behavioral row encodes a tool-specific workaround that is likely to change when tools are upgraded (e.g., a specific CLI flag deprecation). Ask: "Is this stable enough to persist?"
- `[B]` The retry sequence was caused by an environment flake (network timeout, rate limit) rather than a deterministic tool-choice error. Behavioral patterns should not encode stochastic failures.
- `[K→B confusion]` The same raw signal could be interpreted as either a project fact or a behavioral pattern. If ambiguous, show the user both options and ask which they want.

## Self-Audit Score

After completing the checklist, score yourself 0–10:

- 10 = all boxes checked, no red flags, diff shown
- 7–9 = minor boxes unchecked, fixable in 1 minute
- 4–6 = multiple unchecked, do not declare success; re-run
- 0–3 = re-read `SKILL.md` from scratch

**Mode-specific minimum:** if running Behavioral Mode, the behavioral-specific items (`[B]`) must all pass for the score to exceed 7. Passing only Knowledge items in Behavioral Mode is a 3 or lower.

Print the score in your response. If < 7, the user should re-invoke the skill.

## How This File Is Used by the Agent

The agent should not re-read this file on every run. It is loaded on demand by the agent in Phase 4 when it needs the checklist. The full workflow is in `../SKILL.md`.
