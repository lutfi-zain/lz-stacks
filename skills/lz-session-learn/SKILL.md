---
name: lz-session-learn
description: "Reflects on the current (or just-finished) agent session and persists durable learnings into CLAUDE.md, AGENTS.md, MEMORY.md, or any user-specified target file. Use when the user says '/session-learn', 'remember this', 'add to CLAUDE.md', 'log this learning', 'extract learnings', or at the end of a non-trivial coding task. Implements multi-level reflection (micro/meso/macro) and a Read-Write reflective loop so agents stop repeating the same mistakes across sessions."
license: MIT
metadata:
  author: lutfi-zain
  version: "1.0"
  research:
    - "MARS: Memory-Enhanced Agents with Reflective Self-improvement (arXiv 2503.19271)"
    - "SAMULE: Self-Learning Agents Enhanced by Multi-level Reflection (EMNLP 2025)"
    - "Memento 2: Learning by Stateful Reflective Memory (arXiv 2512.22716)"
    - "Contextual Experience Replay (CER) (ACL 2025)"
    - "Anthropic — Effective context engineering for AI agents (2025)"
    - "Anthropic — Skill authoring best practices"
    - "Agent Skills Specification v1 — agentskills.io"
compatibility: Designed for Claude Code, Pi, and any agent supporting the Agent Skills specification. Requires git, bash, and standard unix tools (grep, awk, date).
allowed-tools: Read Write Edit Bash(grep:*) Bash(git:*) Bash(date) Bash(wc)
---

# `lz-session-learn` Workflow

You are a reflective agent. Your job is to **distill the current session into durable, high-signal tokens** that will make the next session (yours or another agent's) measurably better. The work is *not* a transcript dump — it is a Read–Write reflective loop that turns ephemeral conversation into persistent project memory.

> The agent that cannot learn from its own session is doomed to repeat it. The agent that writes its learnings badly is doomed to bloat its own context. This skill does both, surgically.

## When to Use

Use this skill when **any** of the following is true:

- The user explicitly invokes `/session-learn`, `/learn`, `/reflect`, or `remember this`.
- The user says "add to CLAUDE.md", "update AGENTS.md", "save to memory", "log this", "extract learnings", or names a target file.
- A non-trivial task just finished (refactor, bug fix, migration, new feature, research, multi-file edit).
- The same correction, error, or workaround appeared more than once in a single session.
- The user provides a constraint, preference, or rule that *should* survive compaction and the next session.

**Do NOT use** for trivial one-shot Q&A, pure lookups, or any case where the "learning" would be a single fact the model already knows. When in doubt, ask the user before persisting.

## Argument Parsing

`/session-learn` may receive an optional argument that overrides the auto-detected target: $@

| Argument | Behavior |
| --- | --- |
| (none) | Auto-detect target (see [Target Detection](./references/target-detection.md)) |
| `claude` | Force write to `CLAUDE.md` (or `./.claude/CLAUDE.md`) |
| `agents` | Force write to `AGENTS.md` |
| `memory` | Force write to `MEMORY.md` (Claude Code auto-memory) |
| `<path>` | Write to a custom path (e.g. `/skill:lz-session-learn docs/notes/learnings.md`) |
| `--dry-run` | Show the diff that *would* be written; require confirmation before writing |
| `--global` | Treat MEMORY.md as global (`~/.claude/.../memory/MEMORY.md`) instead of project |

## The Read–Write Reflective Loop

The workflow has **five phases**. Do not skip phases. Do not reorder phases.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 1: READ   ─  Gather session context (micro / meso / macro)  │
│      │                                                                │
│      ▼                                                                │
│  Phase 2: REFLECT  ─  Classify each item (Ebbinghaus retention)      │
│      │                                                                │
│      ▼                                                                │
│  Phase 3: TARGET   ─  Auto-detect or honor user's target file       │
│      │                                                                │
│      ▼                                                                │
│  Phase 4: WRITE    ─  Surgically inject (never overwrite, never      │
│      │              dump) into the correct section                  │
│      ▼                                                                │
│  Phase 5: VERIFY   ─  Show diff, run exit checklist, log to memory  │
└─────────────────────────────────────────────────────────────────────┘
```

### Phase 1 — READ: Gather Session Context

Use these signals. **Prefer evidence over narration.**

1. **Tool-call trail** (most reliable): scan recent `Bash`/`Edit`/`Write` calls.
   - `Bash: git diff --name-only HEAD~5..HEAD` (changed files)
   - `Bash: git log --oneline -10` (recent commits)
   - `Bash: ls -lt .` (recent files)
2. **Conversation corrections** (highest signal): any time the user said "no", "actually", "don't", "stop", "wrong", "use X not Y" — capture verbatim.
3. **Repeated patterns**: same import, same fix, same command issued 2+ times.
4. **Errors and recoveries**: tool failures followed by their fixes.
5. **Decisions made**: any "let's go with X" moment with stated rationale.
6. **User-declared facts**: package manager, test command, "we always use Y".

> Do NOT re-read files the agent already read this session. Re-reading is expensive and usually redundant. The session's tool-call history *is* the primary input.

See [references/extraction-heuristics.md](./references/extraction-heuristics.md) for the full signal taxonomy.

### Phase 2 — REFLECT: Multi-Level Classification

Inspired by **SAMULE (EMNLP 2025)**, classify each candidate learning into one of three levels:

| Level | Granularity | Example | Target surface |
| --- | --- | --- | --- |
| **Micro** | Single decision / single fix | "Use `pnpm test --run`, not `pnpm test`, in CI" | Inline row in `## Corrections` or `## Learnings` |
| **Meso** | Pattern across the session | "The repo prefers `Bash`-style migration files; never auto-generate them" | Section in `AGENTS.md` / `MEMORY.md` topic file |
| **Macro** | Cross-session invariant | "Always run `pnpm typecheck` before `pnpm test`" | Hard rule in `CLAUDE.md` |

Then apply an **Ebbinghaus-style retention filter** (from MARS, arXiv 2503.19271): for each candidate, ask

> "If a new agent starts cold tomorrow, will this save a real mistake, a real back-and-forth, or a real re-read?"

- **YES** → persist
- **MAYBE** → persist into a topic file (cheap, easy to drop)
- **NO** → discard (silence is a feature)

If 0 items survive, stop and tell the user: *"No durable learnings detected — this session didn't reveal anything worth persisting."* Do not invent content to fill the file.

### Phase 3 — TARGET: Detect the Write Destination

Run target detection in this order (first hit wins):

1. Honor an explicit argument (`claude`, `agents`, `memory`, custom path).
2. Honor an explicit in-prompt target: *"add to CLAUDE.md"*, *"put this in our notes"*.
3. Auto-detect (see [references/target-detection.md](./references/target-detection.md)):
   - `CLAUDE.md` exists in repo root → `CLAUDE.md` (project rules)
   - `AGENTS.md` exists in repo root → `AGENTS.md` (cross-agent)
   - `MEMORY.md` exists at `~/.claude/projects/<project>/memory/MEMORY.md` → `MEMORY.md` (auto memory)
   - None of the above → ask the user **once** with `ask_user`. Default to `AGENTS.md` if the user picks "don't care".

Never write to a file the user did not authorize. If a target already has a `## Learnings`, `## Historical Session Learnings`, `## Corrections`, or `## MEMORY` section, **append to it** — never replace, never duplicate.

### Phase 4 — WRITE: Surgical Injection

This is where most skills fail. The rules are non-negotiable.

1. **Read the target file first.** Never write to a file you have not read in this session.
2. **Anchor on an existing section** when present (`## Learnings`, `## Corrections`, `## Historical Session Learnings`, `## MEMORY`).
3. **If no anchor exists, create exactly one** named `## Learnings` (or the closest existing convention). Do not invent 5 new sections.
4. **Inject under the anchor**, not at the end of the file. Anchor placement survives refactors; bottom-of-file appends get lost.
5. **One row, one line of meaning.** No paragraphs. No prose essays. Token budgets are finite — see Anthropic context-engineering guidance.
6. **Cite the session signal** so the next agent can verify the rule, e.g. `(from session 2026-06-02: 3× `pnpm test` exit 1 → fix: add `--run`)`.
7. **Use the templates** in [assets/](./assets/) — they are the canonical format.
8. **De-duplicate** before writing: if a row already exists with the same rule, **update the date and exit counter**, do not add a duplicate.

Use this style for the row (matches `lz-create-agentsmd` convention so agents get one consistent format):

```markdown
- **[YYYY-MM-DD]** [Rule] — [Evidence: command / error / file:line]
```

If a topic file is the right home, use [assets/MEMORY_TOPIC.md](./assets/MEMORY_TOPIC.md).

### Phase 5 — VERIFY: Exit Checklist

Before you finish, run this checklist **and copy it into your response**:

- [ ] Every persisted item survived the Ebbinghaus filter (Phase 2).
- [ ] Target file was read before write.
- [ ] No duplicate rows added (searched for keyword overlap).
- [ ] Items were anchored under an existing `## Learnings` or new clearly-marked section.
- [ ] Each row has a date and an evidence citation.
- [ ] `git diff <target>` shown to the user (or equivalent summary).
- [ ] If `CLAUDE.md` was written, the file still fits the **300-line / one-screen** rule (per Anthropic context-engineering guidance) — if it grew past that, propose splitting out a `DESIGN.md` or topic file.
- [ ] `MEMORY.md` first 200 lines / 25KB budget respected (per Claude Code auto-memory spec).

If any box fails, fix it before declaring success.

## Common Rationalizations (Read This Before Skipping Steps)

| Excuse | Reality |
| --- | --- |
| "The session is too small to have learnings" | Even one correction is a learning. The bar is *durable*, not *long*. |
| "I'll just append at the bottom of CLAUDE.md" | Bottom-of-file appends get lost in refactors. Anchor on a section. |
| "Let me dump the whole transcript" | A transcript dump bloats context and violates the 200-line MEMORY.md / 300-line CLAUDE.md rule. Distill. |
| "I don't have time to run git diff" | `git diff` *is* the verification step. Skipping it is the bug. |
| "The user probably wants AGENTS.md" | The user wants *correct* target detection. Auto-detect or ask — never guess and never default silently. |
| "I'll just create a new section header" | One new section per file, max. Reuse `## Learnings`. |
| "This learning is obvious, no need to write it" | Obvious-to-you learnings are the highest-leverage for cold-start agents. Write them. |
| "Let me write a paragraph explaining the context" | One row, one line. Paragraphs are for `docs/`, not for `CLAUDE.md`. |

## Red Flags — Signs the Skill Is Being Violated

- `MEMORY.md` exceeds 200 lines after the write.
- The same rule appears in 3+ different files (de-dup failure).
- A new section named `## AI Learnings` or `## Agent Notes` was invented (use `## Learnings`).
- The user is asked "where should I save?" when an obvious target exists.
- The write was a full-file rewrite instead of a surgical injection.
- The diff shows the existing `## Learnings` was moved or reordered.
- A learning was written without an evidence citation.

## Important Notes

- **Idempotency**: running this skill twice on the same session should converge, not duplicate. Always grep for keyword overlap first.
- **Compaction survival**: items written to project-root `CLAUDE.md` survive `/compact`. Items written to nested `CLAUDE.md` files or to conversation only do **not** — see the [Claude Code memory docs](https://code.claude.com/docs/en/memory) for the full breakdown.
- **Soft enforcement**: `CLAUDE.md` is *guidance*, not a hard rule (~70% adherence per amux 2026). For rules that *must* hold, pair this skill with a `PreToolUse` hook.
- **Token budgets**: a single hard rule in `CLAUDE.md` costs you on **every** turn of every session. A topic file in `MEMORY.md` costs nothing until it's read. Choose the surface accordingly — see [references/target-detection.md](./references/target-detection.md).
- **Privacy**: never persist secrets, API keys, tokens, customer data, or PII. Scrub before writing.
- **Multi-agent fleets**: this skill is per-session, not shared. For fleet-wide learnings, promote a hot learning into `AGENTS.md` (shared) and out of `MEMORY.md` (per-agent).

## See Also

- [references/extraction-heuristics.md](./references/extraction-heuristics.md) — full signal taxonomy
- [references/target-detection.md](./references/target-detection.md) — where to write, decision tree
- [references/anti-rationalizations.md](./references/anti-rationalizations.md) — extended excuse/rebuttal table
- [assets/LEARNINGS_SECTION.md](./assets/LEARNINGS_SECTION.md) — drop-in section template
- [assets/MEMORY_TOPIC.md](./assets/MEMORY_TOPIC.md) — auto-memory topic file template
- [assets/EXTRACTION_CHECKLIST.md](./assets/EXTRACTION_CHECKLIST.md) — pre-write verification
