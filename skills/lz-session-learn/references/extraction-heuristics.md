# Extraction Heuristics

The session is noisy. This reference is the **signal taxonomy** the skill uses in Phase 1 (READ) to filter durable learnings from session chatter.

> Research basis: SAMULE (EMNLP 2025) proposes three reflection levels — micro (single trajectory), meso (intra-task patterns), macro (cross-task invariants). We adopt that vocabulary.

## Quick Decision Matrix

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

## Ebbinghaus Retention Filter (Phase 2)

For every candidate learning, score retention strength `S`:

| Question | +1 if yes |
| --- | --- |
| Would a cold-start agent make this mistake without it? | +1 |
| Is the rule verifiable (test, command, file path)? | +1 |
| Did it appear 2+ times this session? | +1 |
| Is the rule stable (won't be obsolete in 3 months)? | +1 |
| Did the user say "always" / "never" / "remember"? | +2 |

**Decision thresholds:**

- `S ≥ 4` → persist to `CLAUDE.md` (high cost, high signal)
- `S = 2–3` → persist to a `MEMORY.md` topic file (low cost, medium signal)
- `S = 1` → discard
- `S = 0` → definitely discard (e.g., user said "thanks")

This is the same threshold-based memory-update rule MARS uses (Ebbinghaus curve, two thresholds θ₁ > θ₂). See arXiv 2503.19271 §3.2.

## What NOT to Persist (Common Traps)

- **The exact error message verbatim** — link the file instead.
- **Tutorial-grade explanations** — the agent already knows how `pnpm` works.
- **Speculative futures** — "we *might* migrate to turborepo" is noise until it ships.
- **Personal preferences that aren't rules** — "I like dark mode" is not a learning.
- **Things already in `CLAUDE.md`** — always grep first; update the date, don't duplicate.
- **Secrets, tokens, internal URLs** — scrub before writing.

## Signal-Gathering Commands

```bash
# Changed files (last 5 commits)
git diff --name-only HEAD~5..HEAD

# Recent commits
git log --oneline -10

# Recent file activity (top of ls is newest)
ls -lt --time=mtime | head -20

# Look for repeated commands in session (manual, but useful)
# — review the Bash tool-call list for retries

# Look for existing learnings to avoid duplicates
grep -nE '^- \*\*[0-9]{4}-[0-9]{2}-[0-9]{2}\*\*' CLAUDE.md AGENTS.md 2>/dev/null
```

The last command is the most important: it de-duplicates before you write.
