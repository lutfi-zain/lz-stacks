# Extraction Heuristics

The session is noisy. This reference is the **signal taxonomy** the skill uses in Phase 1 (READ) to filter durable learnings from session chatter.

> Research basis: Two extraction modes. **Knowledge Mode** uses SAMULE (EMNLP 2025) three-level reflection — micro (single trajectory), meso (intra-task patterns), macro (cross-task invariants). **Behavioral Mode** uses SkillX (arXiv 2604.04804) trajectory compression and Letta Skill Learning (2025) reflection-creation pipeline.

---

## Mode Selection

Before extracting, determine the mode:

1. If user passed `--knowledge` → Knowledge Mode
2. If user passed `--behave` → Behavioral Mode
3. If user passed `--all` → both (Knowledge first, then Behavioral)
4. If no flag → auto-detect:
   - Scan session for **tool-retry sequences** (same command 2+ times, different tools tried for same goal, error→fix→error→fix). If 2+ such sequences → **Behavioral Mode**
   - Otherwise → **Knowledge Mode**
   - If ambiguous → ask the user

---

## Knowledge Mode Quick Decision Matrix

| Signal observed in session | Level | Worth persisting? | Default target |
| --- | --- | --- | --- |
| User said "no" / "actually" / "stop" / "wrong" | micro → meso | **YES** if it implies a rule, **NO** if it's a one-off preference | `CLAUDE.md` `## Learnings` |
| Same command failed twice with the same fix | meso | **YES** | `MEMORY.md` topic file |
| User declared a package manager / test command | macro | **YES** | `CLAUDE.md` top-of-file |
| Agent invented a fact, then corrected itself | micro | **YES** (anti-pattern) | `MEMORY.md` `## debugging.md` |
| User said "this codebase uses X" | macro | **YES** | `AGENTS.md` Architecture |
| Agent used the wrong file path twice | micro | **YES** if a fix exists | `MEMORY.md` |
| Long discussion that ended with no decision | — | **NO** | — |
| User said "thanks" / "great" | — | **NO** | — |
| Build succeeded after 1 attempt | — | **NO** | — |
| Build succeeded after N≥2 attempts | meso | Maybe — only if the fix is non-obvious | `MEMORY.md` |
| User pasted a long doc / spec | — | **NO** (link to it instead) | — |
| User said "always do X before Y" | macro | **YES** | `CLAUDE.md` |
| Agent guessed and the user accepted silently | — | **NO** | — |

---

## Behavioral Mode Signal Taxonomy (NEW)

This taxonomy is for **Behavioral Mode** only. It extracts agent behavioral optimizations — not project facts.

### Quick Decision Matrix

| Signal observed in session | Level | Worth persisting? | Example row |
| --- | --- | --- | --- |
| Agent tried tool A (fail) → B (fail) → C (success) | micro-behavior | **YES** (high signal) | "When debugging ECS: skip A, B; start with C" |
| Agent re-ran 3 similar commands before the right one | micro-behavior | **YES** | "When checking AWS: use `describe-services` not `list-tasks` first" |
| User said "no" / "don't do that" mid-agent-action | micro-behavior | **YES** if the rejected approach was an agent habit | "Don't guess the path; use `find` first" |
| Agent read the same file 2× unnecessarily | micro-behavior | Maybe | Cache file reads; re-reading wastes turns |
| User said "you already did this before" | meso-behavior | **YES** | "For deployment: chain these 3 commands, don't ask each time" |
| Agent used high-privilege tool when low-privilege works | micro-behavior | **YES** | "For reading config: use `cat`, not `sudo vim`" |
| Same error occurred in 2 different debugging sessions | meso-behavior | **YES** | "When Kafka fails: check disk first, then consumer group" |
| Agent solved problem P with approach 1, then again with approach 2 (better) | meso-behavior | **YES** | "For problem P: use approach 2 directly" |
| User said "you keep starting from scratch" | macro-behavior | **YES** | "For recurring tasks: chain from last session, not from zero" |
| Agent executed commands in suboptimal order | meso-behavior | **YES** | "Check prerequisites before attempting the main command" |
| Agent succeeded on attempt N after N-1 failures | micro-behavior | **YES** | Compress N attempts → 1 optimal path |

### The Retry Compression Pattern

This is the **single most valuable behavioral extraction**. When you see:

```
attempt 1: tool X (fail: reason A)
attempt 2: tool Y (fail: reason B)
attempt 3: tool Z (success)
```

The behavioral learning is **not** "X fails with A, Y fails with B, Z works". That's a knowledge learning.

The behavioral learning **is**:

> "When [trigger scenario]: start with Z. Skip X and Y. Why: X fails with A, Y fails with B."

### The Tool-Choice Anti-Pattern

When the agent reaches for a complex/expensive/powerful tool when a simpler one suffices:

| Anti-pattern | Better first choice |
| --- | --- |
| `execute-command --interactive` | `filter-log-events` (non-interactive) |
| Full git clone | `git ls-remote` / `git archive` |
| Build whole project | `tsc --noEmit` (type-check only) |
| Run all tests | `pytest -xvs <specific file>` |
| `aws ecs describe-tasks` first | `aws ecs list-services` first |

### Behavioral Retention Filter

For each candidate behavioral learning, score `S_b`:

| Question | +1 if yes |
| --- | --- |
| Would a cold agent waste 2+ attempts without this? | +1 |
| Is the behavioral rule verifiable (can it be tested?) | +1 |
| Did the same retry pattern appear 2+ times this session? | +1 |
| Is the behavioral rule stable (won't change next month)? | +1 |
| Did the user explicitly say "you keep doing X"? | +2 |
| Did the retry sequence save 3+ attempts? | +2 |

**Decision thresholds:**

- `S_b ≥ 4` → persist to `## Behavioral Patterns` in target file
- `S_b = 2–3` → persist to topic file (e.g. `behavioral-patterns.md` in MEMORY.md topics)
- `S_b ≤ 1` → discard

## Level 1 — MICRO: Single-Decision Signals

These are individual corrections or observations. They are cheap to capture, easy to verify, and survive Ebbinghaus decay well when they predict a specific mistake.

**Extract when:**

- A tool call failed and the next call worked — capture the fix.
- A user correction was direct ("use `pnpm`, not `npm`").
- An assumption was overturned by a test or a doc read.
- The same value appeared in 2+ places (suggests a hidden invariant).

**Format:**

```markdown
- **[YYYY-MM-DD]** [Imperative rule] — `[evidence: command, error code, file:line]`
```

**Example:**

```markdown
- **2026-06-02** Use `pnpm test --run`, not `pnpm test` — `(from CI log: 3× exit 1; --run disables watch mode)`
```

## Level 2 — MESO: Pattern-within-Session Signals

These appear 2+ times in one session. They are higher signal than micro because they indicate *recurring* friction, not a one-off.

**Extract when:**

- A command was retried with the same fix.
- The agent reached for the wrong file twice.
- Two unrelated tasks hit the same architectural wall.
- The user repeated a constraint ("don't forget the `--run` flag") after the agent had already seen it.

**Format:** A short section header + 2-4 rows.

**Example (auto-memory topic file):**

```markdown
# Testing

- Use `pnpm test --run` in CI / one-shot contexts. Watch mode hangs in non-TTY environments.
- Coverage report is written to `./coverage/lcov.info` — link from PRs.
- Snapshot tests are colocated, not in `__snapshots__/`. Don't move them.
```

## Level 3 — MACRO: Cross-Session Invariants

These are rules that should outlive the session, the project, and possibly the team. They are the highest-leverage but the hardest to verify, so they are also the easiest to over-claim.

**Extract when:**

- The user stated a hard rule ("never merge without a changelog entry").
- The codebase reveals a non-negotiable convention (every PR has a screenshot).
- A failure mode is severe enough to warrant a `PreToolUse` hook.
- A correction was given that the user explicitly said "remember this for next time".

**Format:** A bullet in the appropriate top-level section of `CLAUDE.md` or `AGENTS.md`, ideally in the **Hard Rules** or **Prohibitions** block.

**Example:**

```markdown
## Hard Rules
- Never push to `main` directly. Branch + PR only. (Lint fails otherwise.)
- All API responses go through `src/lib/response.ts`. Don't hand-roll JSON shapes.
```

## Knowledge Mode Retention Filter (Phase 2)

For every candidate learning in Knowledge Mode, score retention strength `S`:

| Question | +1 if yes |
| --- | --- |
| Would a cold-start agent make this mistake without it? | +1 |
| Is the rule verifiable (test, command, file path)? | +1 |
| Did it appear 2+ times this session? | +1 |
| Is the rule stable (won't be obsolete in 3 months)? | +1 |
| Did the user say "always" / "never" / "remember"? | +2 |

**Decision thresholds:**

- `S ≥ 4` → persist to `CLAUDE.md` or `AGENTS.md` (high cost, high signal)
- `S = 2–3` → persist to a `MEMORY.md` topic file (low cost, medium signal)
- `S = 1` → discard
- `S = 0` → definitely discard (e.g., user said "thanks")

This is the same threshold-based memory-update rule MARS uses (Ebbinghaus curve, two thresholds θ₁ > θ₂). See arXiv 2503.19271 §3.2.

## What NOT to Persist (Common Traps)

- **The exact error message verbatim** — link the file instead.
- **Tutorial-grade explanations** — the agent already knows how `pnpm` works.
- **Speculative futures** — "we *might* migrate to turborepo" is noise until it ships.
- **Personal preferences that aren't rules** — "I like dark mode" is not a learning.
- **Things already in target file** — always grep first; update the date, don't duplicate.
- **Secrets, tokens, internal URLs** — scrub before writing.
- **Mixed-mode rows** — don't put behavioral rows in `## Learnings` or knowledge rows in `## Behavioral Patterns`. Each mode has its own section.

## Signal-Gathering Commands

### Knowledge Mode

```bash
# Changed files (last 5 commits)
git diff --name-only HEAD~5..HEAD

# Recent commits
git log --oneline -10

# Recent file activity (top of ls is newest)
ls -lt --time=mtime | head -20

# Look for existing Learnings to avoid duplicates
grep -nE '^- \*\*[0-9]{4}-[0-9]{2}-[0-9]{2}\*\*' CLAUDE.md AGENTS.md 2>/dev/null
```

### Behavioral Mode (NEW)

```bash
# Look for repeated tool-use patterns in the session
# Manual scan of tool-call list for retry sequences:
#   same goal → tool A (fail) → tool B (fail) → tool C (success)

# Check if similar behavioral patterns already exist
grep -nE 'When [a-z]' AGENTS.md CLAUDE.md 2>/dev/null || true
grep -n 'Behavioral Patterns' AGENTS.md CLAUDE.md 2>/dev/null || true

# Count how many attempts before success for recent tasks
# (manual: review Bash tool calls for repeated commands)
```

The de-duplication grep is the most important step for both modes.
