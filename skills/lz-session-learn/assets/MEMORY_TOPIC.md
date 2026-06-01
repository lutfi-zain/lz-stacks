# MEMORY_TOPIC.md — Auto-Memory Topic File Template

> Use this template when a learning is too detailed for a one-line row in `MEMORY.md` (the auto-memory index) but valuable enough to keep. Topic files live alongside `MEMORY.md` in `~/.claude/projects/<project>/memory/`. They are **not** loaded at session start; the agent reads them on demand.

## When to Use a Topic File (vs. `MEMORY.md`)

| Case | Use |
| --- | --- |
| One-line rule, evidence = a single command | `MEMORY.md` row |
| One-line rule, evidence = 3+ commands / a paragraph | **Topic file** |
| Multi-step debugging recipe | **Topic file** |
| Cross-session invariant that must always be loaded | Move to project `CLAUDE.md` instead |

## File Naming

`<topic>.md` — lowercase, hyphen-separated, describes the content.

Examples:

- `debugging.md`
- `testing-conventions.md`
- `migration-recipes.md`
- `api-gotchas.md`
- `team-preferences.md`

Avoid generic names (`notes.md`, `misc.md`, `stuff.md`). Specific names are findable via grep.

## Drop-In Template

Copy the block below. Replace placeholders.

````markdown
# {{Topic Title}}

> Topic file for Claude Code auto-memory. Loaded on demand. Maintained by
> the `lz-session-learn` skill. Keep under 100 lines — this file is fully
> read into context when relevant, so token cost = full file size.

## Context

[1-3 sentences on why this topic exists. What kind of session produces
these notes? What mistake does this prevent?]

## Rules

- **[{{YYYY-MM-DD}}]** [Imperative rule] — `[evidence]`
- **[{{YYYY-MM-DD}}]** [Imperative rule] — `[evidence]`
- **[{{YYYY-MM-DD}}]** [Imperative rule] — `[evidence]`

## Recipes

### {{Recipe name}}

[Step-by-step, with code blocks. Include the failing case, the fix, and
the verification command.]

```bash
# failing
$ pnpm test
...hangs (watch mode)

# fix
$ pnpm test --run
...passes
```

## Anti-Patterns

- ❌ {{thing that looks right but isn't}} — `{{why it fails}}`
- ❌ {{another anti-pattern}} — `{{why it fails}}`

## Cross-References

- Project `CLAUDE.md` — `## Hard Rules` (promoted invariants)
- `MEMORY.md` — index entry
- `../other-topic.md` — related notes
````

## How `MEMORY.md` Indexes This File

In `MEMORY.md`, add exactly one line per topic file under a `## Topics` (or `## Topic Files`) section:

```markdown
## Topics

- `debugging.md` — recurring build/test failures and the one-line fixes
- `api-gotchas.md` — gotchas specific to our REST conventions
- `migration-recipes.md` — step-by-step DB migration patterns
```

That's the entire index. Topic files are not summarized in `MEMORY.md` because the index loads on every session — summarizing them would defeat the lazy-load.

## Worked Example

**Topic file: `~/.claude/projects/_work_myrepo/memory/testing-conventions.md`**

````markdown
# Testing Conventions

> Topic file. Loaded on demand. Maintained by `lz-session-learn`.

## Context

This repo uses Vitest with a non-standard watch-mode behavior that bites
new agents. These rules prevent the 2 most common CI failures.

## Rules

- **[2026-06-02]** Use `pnpm test --run` in non-TTY contexts (CI, one-shots).
  Watch mode hangs without a TTY and CI exits 1. — `[evidence: 3× CI log 2026-05 to 2026-06]`
- **[2026-05-12]** Coverage report is written to `./coverage/lcov.info`.
  Upload from this path in CI; do not pass a glob. — `[evidence: codecov.yml]`
- **[2026-05-04]** Snapshot tests are colocated as `*.test.tsx.snap` next to
  the test file, not under `__snapshots__/`. Don't move them. — `[evidence: vitest.config.ts]`

## Recipes

### Run the full test suite locally

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test --run
pnpm test:coverage
```

### Run a single test file with verbose output

```bash
pnpm test --run src/lib/auth.test.ts --reporter=verbose
```

## Anti-Patterns

- ❌ `pnpm test` in CI — hangs in watch mode, exits 1.
- ❌ Moving snapshots to `__snapshots__/` — breaks the diff tool we use in code review.
- ❌ Mocking `fetch` globally — use `msw` instead; see `api-gotchas.md`.

## Cross-References

- Project `CLAUDE.md` — `## Commands` (where `pnpm test` is defined)
- `api-gotchas.md` — HTTP-mocking conventions
````

**`MEMORY.md` index entry:**

```markdown
## Testing

- `testing-conventions.md` — Vitest gotchas, CI command flags, snapshot layout
```

## Cleanup Cadence

Topic files rot. Every quarter:

1. Read each topic file.
2. If a rule's evidence is > 6 months old and unverifiable, mark it `[stale-verify]` or remove.
3. If a topic file is < 30 lines, consider inlining into `MEMORY.md` (cost is similar).
4. If a topic file is > 150 lines, split it.

The skill does NOT auto-clean. The user (or the user invoking `/session-learn`) decides what stays.
