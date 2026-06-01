# Anti-Rationalizations (Extended)

> Adapted from addyosmani/agent-skills' "Common Rationalizations" pattern. The full table lives in `SKILL.md`; this file is the long-form version with rebuttals, evidence, and research grounding.

The point of this table is not to shame the agent. It's to make the **excuses that skip work as costly to invoke as the work itself**. Every rationalization below has been observed in real agent sessions, and each one has a downstream cost that the agent did not pay when it took the shortcut.

## The Extended Table

### R1 — "The session is too small to have learnings."

- **Cost of skipping**: the agent will repeat the same correction next session.
- **Counter**: a 1-row learning is still a learning. The bar is *durable*, not *long*. One row that saves a 10-minute back-and-forth next time has positive ROI.
- **Source**: SAMULE (EMNLP 2025) — even single-trajectory reflections (micro level) measurably improve agent performance on TravelPlanner, NATURAL PLAN, Tau-bench.

### R2 — "I'll just append at the bottom of CLAUDE.md."

- **Cost of skipping**: bottom-of-file appends are invisible to agents that scan top-down. After one or two refactors, the section is "lost" and the rule silently stops being followed.
- **Counter**: anchor on `## Learnings` (or equivalent). Refactors preserve section headers; they do not preserve bottom-of-file text.
- **Source**: Anthropic CLAUDE.md guide — "keep CLAUDE.md under 300 lines" implies curated structure, not free-form append.

### R3 — "Let me dump the whole transcript."

- **Cost of skipping**: `MEMORY.md` is capped at 200 lines / 25KB by Claude Code. `CLAUDE.md` should fit on one screen. A transcript dump breaks both budgets and triggers the *opposite* of the desired effect: agents start ignoring the file entirely.
- **Counter**: distill. One row, one line of meaning. Cite the evidence so the next agent can verify the rule without re-deriving it.
- **Source**: Anthropic context-engineering cookbook — compaction is "lossy by design" and preserves decisions, not transcripts.

### R4 — "I don't have time to run git diff."

- **Cost of skipping**: without a diff, the user has no way to review or reject the change. A bad write becomes a "fix the fix" cycle.
- **Counter**: `git diff <target>` (or `cat` for untracked files) is the verification step, not a polish step. 2 seconds of compute.
- **Source**: lz-create-agentsmd skill's exit checklist — verification is a hard requirement, not a suggestion.

### R5 — "The user probably wants AGENTS.md."

- **Cost of skipping**: silent wrong-target writes train the user to distrust the skill. They start undoing it.
- **Counter**: detect, then ask once if detection fails. Never guess, never default silently. The user is the only authority on where their notes go.
- **Source**: lz-create-agentsmd Phase 2 — "MUST NOT generate the file yet" until user validates.

### R6 — "I'll just create a new section header."

- **Cost of skipping**: section header proliferation fragments context. Every new header is one more "where do I look?" for the next agent.
- **Counter**: one anchor per file. Use `## Learnings` (or the closest existing convention). If none exists, create exactly one and reuse forever.
- **Source**: amux 2026 — "the core skill of context engineering is putting information on the right surface; minimize the number of distinct surfaces."

### R7 — "This learning is obvious, no need to write it."

- **Cost of skipping**: obvious-to-you is highest-leverage for cold-start agents. The whole point of `CLAUDE.md` is to encode things that are *not* obvious from reading the code.
- **Counter**: write it. If a teammate would need it to be productive, it's not obvious.
- **Source**: Claude Code memory docs — "what is worth remembering based on whether the information would be useful in a future conversation."

### R8 — "Let me write a paragraph explaining the context."

- **Cost of skipping**: a paragraph is a token-tax on every turn, forever. CLAUDE.md is the highest-cost surface in the system (per amux 2026, "every token here is paid on every turn").
- **Counter**: one row, one line. Move the paragraph to a topic file (zero cost until read) or to `docs/` (human-only).
- **Source**: amux 2026 — "for every line in CLAUDE.md, ask: 'If I remove this, will the agent make a mistake it cannot recover from by reading the code?' If the answer is no, cut it."

### R9 — "The session is still in progress, I can't reflect yet."

- **Cost of skipping**: in-flight sessions lose context to compaction before the user explicitly asks for a reflection.
- **Counter**: the skill is *also* valid mid-session. Run it any time the user says `/session-learn` or `remember this` — don't gate on "is the session done?". The user knows when they want to commit a learning.
- **Source**: lz-daily-reflect skill — same "any time" pattern; both are user-triggered, not auto-triggered.

### R10 — "Hard rules belong in CLAUDE.md, no question."

- **Cost of skipping**: not always. `CLAUDE.md` is *guidance*, not enforcement (~70% adherence per amux 2026). For rules that *must* hold, pair this skill with a `PreToolUse` hook.
- **Counter**: hard rules go in `CLAUDE.md` *and* a hook. The skill writes the rule; the hook enforces it.
- **Source**: amux 2026 — "for rules like 'don't push to main' or 'don't delete the production database', 70% [CLAUDE.md compliance] is a disaster waiting to happen. Use a hook."

### R11 — "The user just said 'remember this' — context-free, no evidence."

- **Cost of skipping**: vague rules rot fast. "Remember to be careful with migrations" is a 6-months-later footgun.
- **Counter**: ask the user to disambiguate *one* time. "Did you mean: (a) never auto-generate migrations, (b) always run with `--dry-run` first, (c) something else?" Pick the most-likely, write that, cite the source conversation turn.
- **Source**: Anthropic — "specific, concise, well-structured instructions work best."

### R12 — "I'll just put it in MEMORY.md — it's faster."

- **Cost of skipping**: `MEMORY.md` is auto-loaded (first 200 lines) on every session. A flood of small learnings pollutes the hot path.
- **Counter**: small/medium learnings go in *topic files* (`MEMORY.md/.../foo.md`), with a 1-line index entry in `MEMORY.md`. Topic files are loaded on demand — zero cost until needed.
- **Source**: Claude Code auto-memory design — "MEMORY.md acts as a table of contents. Claude reads it at the start of every session, then loads individual topic files when they're relevant."

### R13 — "I'll write the rule in 3 different files to be safe."

- **Cost of skipping**: 3× the maintenance, 3× the contradiction risk. The next agent that reads two of them and finds a 1-word difference will pick arbitrarily.
- **Counter**: write in one place. Pick the surface with the lowest cost that still gets read. Cite that single source from the others if cross-references are needed.
- **Source**: amux 2026 — "if you have low awareness of what's in your context because you copied a lot from a stranger, you might inadvertently repeat instructions or contradict existing ones."

### R14 — "I can describe the section layout in the row itself."

- **Cost of skipping**: descriptive rows bloat `CLAUDE.md` and `MEMORY.md`. They're read on every turn.
- **Counter**: put the description in a topic file. The row in `## Learnings` should be a one-liner; the rationale lives in the topic file and is loaded on demand.
- **Source**: progressive disclosure pattern in Agent Skills spec — keep the index lean, push detail to references/.

## How to Use This File

When you (the agent) are about to skip a step, find the matching `R#` and read the **Cost of skipping** line. If that cost is higher than the cost of doing the step, do the step.

This is the same anti-rationalization table pattern that `TDD`, code review, and security checklists use. The principle is general: **excuses are free; bugs from skipped steps are not**.

## References

- addyosmani/agent-skills — `docs/skill-anatomy.md` — original "Common Rationalizations" pattern.
- SAMULE (EMNLP 2025) — micro/meso/macro levels.
- MARS (arXiv 2503.19271) — Ebbinghaus retention thresholds.
- Memento 2 (arXiv 2512.22716) — Read-Write Reflective Learning.
- amux (2026) — six context surfaces, ~70% CLAUDE.md adherence.
- Claude Code memory docs — auto-memory design.
