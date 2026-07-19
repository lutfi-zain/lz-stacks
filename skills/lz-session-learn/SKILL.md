---
name: lz-session-learn
description: "Dual-mode session reflection skill. **Knowledge Mode** (default): extracts durable project facts, conventions, and corrections into CLAUDE.md / AGENTS.md / MEMORY.md. **Behavioral Mode**: analyzes agent tool-call trajectories and trial sequences, then persists behavioral optimizations so the agent skips wasted steps next time. Use when the user says '/session-learn', 'remember this', 'add to CLAUDE.md', 'log this learning', 'extract learnings', or at the end of a non-trivial coding task. Pass '--behave' or '--knowledge' to pick mode; auto-detects when omitted. Implements multi-level reflection (micro/meso/macro) and a Read-Write reflective loop so agents stop repeating the same mistakes across sessions."
license: MIT
metadata:
  author: lutfi-zain
  version: "2.0"
  research:
    - "SkillX: Automatically Constructing Skill Knowledge Bases for Agents (arXiv 2604.04804)"
    - "Letta Skill Learning — Bringing Continual Learning to CLI Agents (2025)"
    - "Self-Improving AI Coding Agents Through Accumulated Behavioral Rules (arXiv 2607.13091)"
    - "Self-Improvements in Modern Agentic Systems: A Survey (arXiv 2607.13104)"
    - "LLMs in the Imaginarium: Tool Learning through Simulated Trial and Error (arXiv 2403.04746)"
    - "MARS: Memory-Enhanced Agents with Reflective Self-improvement (arXiv 2503.19271)"
    - "SAMULE: Self-Learning Agents Enhanced by Multi-level Reflection (EMNLP 2025)"
    - "Memento 2: Learning by Stateful Reflective Memory (arXiv 2512.22716)"
    - "Anthropic — Effective context engineering for AI agents (2025)"
    - "Agent Skills Specification v1 — agentskills.io"
compatibility: Designed for Claude Code, Pi, and any agent supporting the Agent Skills specification. Requires git, bash, and standard unix tools (grep, awk, date).
allowed-tools: Read Write Edit Bash(grep:*) Bash(git:*) Bash(date) Bash(wc)
---

# `lz-session-learn` Workflow

You are a reflective agent with **two operating modes**. Your job is to **distill the current session into durable, high-signal tokens** that will make the next session measurably better. The work is *not* a transcript dump — it is a Read–Write reflective loop that turns ephemeral conversation into persistent improvement.

> The agent that cannot learn from its own session is doomed to repeat it. The agent that writes its learnings badly is doomed to bloat its own context. The agent that never fixes its **behavior** is doomed to waste N retries every session.

---

## Two Modes

| Mode | Flag | What it extracts | Writes to | When to use |
| --- | --- | --- | --- | --- |
| **Knowledge** (default) | `--knowledge` | Project facts, conventions, user corrections, build errors, architecture decisions | `## Learnings`, `## Hard Rules`, `## Corrections` | User gave a rule, fix, or convention |
| **Behavioral** | `--behave` | Agent tool-choice patterns, retry compression, wasted-step elimination, optimal first-attempt path | `## Behavioral Patterns` | Agent wasted N attempts before succeeding; tool sequence can be optimized |

**Auto-detect logic** when no flag given: scan session signals. If 2+ tool retries or obvious redundancy (same command 3×, wrong tool 2×), default to **Behavioral**. Otherwise default to **Knowledge**. If ambiguous, ask the user.

---

## When to Use

Use this skill when **any** of the following is true:

- The user explicitly invokes `/session-learn`, `/learn`, `/reflect`, or `remember this`.
- The user says "add to CLAUDE.md", "update AGENTS.md", "save to memory", "log this", "extract learnings", or names a target file.
- A non-trivial task just finished (refactor, bug fix, migration, new feature, research, multi-file edit).
- The same correction, error, or workaround appeared more than once in a single session.
- The user provides a constraint, preference, or rule that *should* survive compaction and the next session.
- **The agent tried 2+ approaches before one succeeded** — this is the highest-signal trigger for Behavioral Mode.
- **The user said "don't start from scratch" or "you did this before"** — behavioral pattern detected.

**Do NOT use** for trivial one-shot Q&A, pure lookups, or any case where the "learning" would be a single fact the model already knows. When in doubt, ask the user before persisting.

## Argument Parsing

`/session-learn` may receive optional arguments. **Mode flags** and **target flags** can be combined (e.g. `/session-learn --behave agents`).

### Mode Flags

| Flag | Behavior |
| --- | --- |
| (none) | Auto-detect mode + target |
| `--knowledge` or `-k` | Force **Knowledge Mode** (project facts, conventions, corrections) |
| `--behave` or `-b` | Force **Behavioral Mode** (agent behavioral patterns, retry compression) |
| `--all` or `-a` | Run **both modes** sequentially (Knowledge first, then Behavioral) |

### Target Flags

| Argument | Behavior |
| --- | --- |
| (none) | Auto-detect target (see [Target Detection](./references/target-detection.md)) |
| `claude` | Force write to `CLAUDE.md` (or `./.claude/CLAUDE.md`) |
| `agents` | Force write to `AGENTS.md` |
| `memory` | Force write to `MEMORY.md` (Claude Code auto-memory) |
| `<path>` | Write to a custom path (e.g. `/skill:lz-session-learn docs/notes/learnings.md`) |
| `--dry-run` | Show the diff that *would* be written; require confirmation before writing |
| `--global` | Treat MEMORY.md as global (`~/.claude/.../memory/MEMORY.md`) instead of project |

**Examples:**

```bash
/session-learn                       # auto-detect mode + target
/session-learn --behave               # behavioral mode, auto-detect target
/session-learn --behave agents        # behavioral mode → AGENTS.md
/session-learn --knowledge claude     # knowledge mode → CLAUDE.md
/session-learn --all                  # both modes, auto-detect target
/session-learn --behave --dry-run     # behavioral, show diff first
```

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

Use these signals. **Prefer evidence over narration.** The signals differ by mode.

#### Knowledge Mode Signals

1. **Tool-call trail** (most reliable): scan recent `Bash`/`Edit`/`Write` calls.
   - `Bash: git diff --name-only HEAD~5..HEAD` (changed files)
   - `Bash: git log --oneline -10` (recent commits)
   - `Bash: ls -lt .` (recent files)
2. **Conversation corrections** (highest signal): any time the user said "no", "actually", "don't", "stop", "wrong", "use X not Y" — capture verbatim.
3. **Repeated patterns**: same import, same fix, same command issued 2+ times.
4. **Errors and recoveries**: tool failures followed by their fixes.
5. **Decisions made**: any "let's go with X" moment with stated rationale.
6. **User-declared facts**: package manager, test command, "we always use Y".

#### Behavioral Mode Signals (NEW)

1. **Tool-retry sequences**: scan the session for chains like `tool A (fail) → tool B (fail) → tool C (success)`. These are the highest-value behavioral learnings — compress the sequence so next time the agent starts with tool C.
2. **Wasted-step detection**: commands that were irrelevant, files re-read unnecessarily, or approaches that the user rejected. Look for "no", "actually", "don't do that" after the agent already took action.
3. **Optimal-first-attempt extraction**: given a trajectory with exploration, derive the minimal successful path. The behavioral learning is: "when the user asks for X, do Y immediately, not Z".
4. **Same-goal-different-approach**: the agent solved problem P twice in the session using different approaches. The second approach was better. Extract why.
5. **Tool-choice anti-patterns**: reaching for a high-complexity tool when a simpler one suffices (e.g., `execute-command` when `filter-log-events` works).

> **Technique: Retry Compression.** Take a sequence of N tool calls where calls 1..N-1 failed and call N succeeded. The behavioral learning is: "skip calls 1..N-1; start with call N". Do not store the error messages — store the compressed optimal path.

See [references/extraction-heuristics.md](./references/extraction-heuristics.md) for the full signal taxonomy (both modes).

> Do NOT re-read files the agent already read this session. Re-reading is expensive and usually redundant. The session's tool-call history *is* the primary input for both modes.

### Phase 2 — REFLECT: Multi-Level Classification

Classification logic differs by mode.

#### Knowledge Mode (same as v1)

Inspired by **SAMULE (EMNLP 2025)**, classify each candidate learning into one of three levels:

| Level | Granularity | Example | Target surface |
| --- | --- | --- | --- |
| **Micro** | Single decision / single fix | "Use `pnpm test --run`, not `pnpm test`, in CI" | Inline row in `## Corrections` or `## Learnings` |
| **Meso** | Pattern across the session | "The repo prefers `Bash`-style migration files; never auto-generate them" | Section in `AGENTS.md` / `MEMORY.md` topic file |
| **Macro** | Cross-session invariant | "Always run `pnpm typecheck` before `pnpm test`" | Hard rule in `CLAUDE.md` |

#### Behavioral Mode (NEW)

Inspired by **SkillX (arXiv 2604.04804)** and **Letta Skill Learning (2025)**, classify candidates into three behavioral levels:

| Level | Granularity | Example | Target surface |
| --- | --- | --- | --- |
| **Micro-behavior** | Single tool-retry compression | "When debugging ECS: skip `execute-command`, use `filter-log-events` directly" | Inline row in `## Behavioral Patterns` |
| **Meso-behavior** | Pattern across the session | "When user asks to check AWS service, always check CloudWatch logs before trying SSM" | Section in `AGENTS.md` `## Behavioral Patterns` |
| **Macro-behavior** | Cross-session invariant | "Never start debugging with an expensive command; run cheap read/check first" | Hard rule in `CLAUDE.md` `## Behavioral Patterns` |

#### Retention Filter (both modes)

Apply the appropriate retention question:

| Mode | Retention question |
| --- | --- |
| **Knowledge** | "If a cold agent starts tomorrow, will this save a real mistake, a real back-and-forth, or a real re-read?" |
| **Behavioral** | "If a cold agent starts tomorrow, will this **save N retries** and skip directly to the working approach?" |

Then score:

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
2. **Anchor on an existing section** when present:
   - Knowledge Mode: `## Learnings`, `## Corrections`, `## Historical Session Learnings`, `## MEMORY`, `## Hard Rules`
   - Behavioral Mode: `## Behavioral Patterns` (existing), or create it
3. **If no anchor exists, create exactly one:**
   - Knowledge Mode: `## Learnings`
   - Behavioral Mode: `## Behavioral Patterns`
   Do not invent 5 new sections.
4. **Inject under the anchor**, not at the end of the file. Anchor placement survives refactors; bottom-of-file appends get lost.
5. **One row, one line of meaning.** No paragraphs. No prose essays. Token budgets are finite.
6. **Cite the session signal** so the next agent can verify.
7. **Use the templates** in [assets/](./assets/).
8. **De-duplicate** before writing: if a row already exists with the same rule, **update the date and exit counter**, do not add a duplicate.

#### Knowledge Mode Row Format

```markdown
- **[YYYY-MM-DD]** [Rule] — `[Evidence: command / error / file:line]`
```

#### Behavioral Mode Row Format (NEW)

```markdown
- **[YYYY-MM-DD]** When [scenario]: [optimal-first-step, not wasted-step].
  Rationale: [why the wasted approach fails].
  Evidence: [N retries → compressed to 1]
```

**Examples:**

```markdown
- **[2026-06-02]** When debugging HIS ECS services: skip `execute-command`
  (no SSM agent), start with `CloudWatch filter-log-events` directly.
  Rationale: execute-command always fails with TargetNotConnectedException.
  Evidence: 2 failed execute-command attempts → switched to filter-log-events
  → got logs immediately.

- **[2026-06-02]** When user asks "check AWS config": read Secrets Manager
  `get-secret-value` before checking Task Definition env vars.
  Rationale: Secrets Manager is the source of truth; Task Definition often
  shows `environment: []` even when config is loaded at runtime.
  Evidence: wasted 2 rounds checking Task Definition before verifying
  Secrets Manager.
```

#### Both Modes Can Run

When `--all` is passed, run Knowledge Mode first (writes to `## Learnings`), then Behavioral Mode (writes to `## Behavioral Patterns`). Both sections can coexist in the same target file.

If a topic file is the right home for behavioral details, use [assets/BEHAVIORAL_SECTION.md](./assets/BEHAVIORAL_SECTION.md) or [assets/MEMORY_TOPIC.md](./assets/MEMORY_TOPIC.md).

### Phase 5 — VERIFY: Exit Checklist

Before you finish, run this checklist **and copy it into your response**. Items marked `[B]` are behavioral-mode-specific.

- [ ] Every persisted item survived the retention filter (Phase 2, matching current mode).
- [ ] Target file was read before write.
- [ ] No duplicate rows added (searched for keyword overlap).
- [ ] Items were anchored under the correct section for the mode:
  - Knowledge: `## Learnings`, `## Corrections`, `## Hard Rules`
  - Behavioral: `## Behavioral Patterns`
- [ ] Each row has a date and an evidence citation.
- [B] Each behavioral row includes: scenario trigger + optimal step + rationale (why old approach fails).
- [B] Behavioral rows are action-oriented ("skip X, start with Y") — not fact-oriented ("X doesn't work").
- [B] If retry compression was applied: the row says how many retries were saved.
- [ ] `git diff <target>` shown to the user (or equivalent summary).
- [ ] If `CLAUDE.md` was written, the file still fits the **300-line / one-screen** rule — if it grew past that, propose splitting out a topic file.
- [ ] `MEMORY.md` first 200 lines / 25KB budget respected.

If any box fails, fix it before declaring success.

## Common Rationalizations (Read This Before Skipping Steps)

| Excuse | Reality |
| --- | --- |
| "The session is too small to have learnings" | Even one correction is a learning. The bar is *durable*, not *long*. A single retry compression can save 3+ wasted attempts next time. |
| "I'll just append at the bottom of CLAUDE.md" | Bottom-of-file appends get lost in refactors. Anchor on a section. |
| "Let me dump the whole transcript" | A transcript dump bloats context and violates size budgets. Distill. |
| "I don't have time to run git diff" | `git diff` *is* the verification step. Skipping it is the bug. |
| "The user probably wants AGENTS.md" | The user wants *correct* target detection. Auto-detect or ask — never guess and never default silently. |
| "I'll just create a new section header" | One new section per file, max. Knowledge → `## Learnings`. Behavioral → `## Behavioral Patterns`. |
| "This learning is obvious, no need to write it" | Obvious-to-you learnings are the highest-leverage for cold-start agents. Write them. |
| "Let me write a paragraph explaining the context" | One row, one line. Paragraphs are for `docs/`, not for instruction files. |
| "I'll just use Knowledge Mode — findings are findings" | **Wrong.** A debugging trail ("X failed, Y failed, Z worked") is a *behavioral* pattern, not a project fact. Writing it as a Knowledge row loses the action-orientation. Use Behavioral Mode so the next agent knows *what to do first*, not just what to avoid. |
| "The agent's retry sequence isn't a learning — the final fix is" | **Wrong.** The learning *is* the compression. "Skip A and B, start with C" is higher-signal than just "C works" because it tells the agent what *not* to waste time on. |
| "I'll put behavioral patterns in ## Learnings to keep it simple" | **Wrong.** `## Learnings` is for project facts. `## Behavioral Patterns` is for agent conduct. Mixing them creates confusion: the next agent won't know if a row is a codebase rule or a behavioral directive. |

---

## Important Notes

- **Mode idempotency**: running Knowledge Mode twice on the same session should converge (same `## Learnings` rows). Running Behavioral Mode twice should converge (same `## Behavioral Patterns` rows). Rows from different modes never collide because they target different sections.
- **Compaction survival**: items written to project-root files survive `/compact`. Items written to `## Behavioral Patterns` in `AGENTS.md` survive. Items in topic files do not, but can be re-loaded.
- **Behavioral rows fade**: unlike hard rules, behavioral patterns may become outdated as the agent's tool set or environment changes. If 3+ sessions pass without a behavioral rule being relevant, the user should consider deleting it.
- **Privacy**: never persist secrets, API keys, tokens, customer data, or PII. Scrub before writing.
- **Multi-agent fleets**: behavioral patterns written to `AGENTS.md` are shared fleet-wide. Use `MEMORY.md` for per-agent behavioral notes.

## See Also

- [references/extraction-heuristics.md](./references/extraction-heuristics.md) — full signal taxonomy for both modes
- [references/target-detection.md](./references/target-detection.md) — where to write, decision tree
- [references/anti-rationalizations.md](./references/anti-rationalizations.md) — extended excuse/rebuttal table
- [assets/BEHAVIORAL_SECTION.md](./assets/BEHAVIORAL_SECTION.md) — drop-in `## Behavioral Patterns` template
- [assets/LEARNINGS_SECTION.md](./assets/LEARNINGS_SECTION.md) — drop-in `## Learnings` template
- [assets/MEMORY_TOPIC.md](./assets/MEMORY_TOPIC.md) — auto-memory topic file template
- [assets/EXTRACTION_CHECKLIST.md](./assets/EXTRACTION_CHECKLIST.md) — pre-write verification

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
