# Learnings Section — Drop-In Template

> Use this template when injecting into `CLAUDE.md` or `AGENTS.md` and the file has **no** existing `## Learnings` (or equivalent) section. Otherwise, anchor on the existing section.

## Drop-In Snippet (Markdown)

Copy the block below. Replace `{{DATE}}` with `YYYY-MM-DD` and fill in the rows.

````markdown
## Learnings

> Persistent notes derived from agent sessions. Each row is a rule with evidence.
> Auto-maintained by the `lz-session-learn` skill. Do not edit rows by hand —
> instead, run `/session-learn` to append/update. New rows go at the **top**,
> just below this header, so the most recent learnings are always first.

- **[{{DATE}}]** [Imperative rule, ≤ 80 chars] — `[evidence: command, error, file:line, or session signal]`
- **[{{DATE}}]** [Another rule] — `[evidence]`
- **[{{DATE}}]** [Another rule] — `[evidence]`
````

## Conventions

- **Date format**: ISO `YYYY-MM-DD` so rows sort lexicographically.
- **Row length**: ≤ 80 characters for the rule itself. The evidence citation can extend the row but should stay on a single line.
- **Imperative voice**: start with a verb. *Use X, not Y. Never do Z. Always check W before Q.*
- **Evidence citation**: a command, an error code, a `file:line`, or a quoted session phrase. Verifiable beats poetic.
- **No prose paragraphs** in the row. If you need a paragraph, it belongs in a topic file.
- **Most recent first**: new rows go at the top, just under the header. This matches how humans skim a changelog and matches the auto-memory spec (recent = loaded).

## Anti-Patterns to Avoid in Rows

| Bad | Good |
| --- | --- |
| "It might be a good idea to consider using pnpm" | "Use `pnpm`, not `npm`" |
| "Per our previous conversation about testing" | "Run `pnpm test --run` in CI" |
| "(see also: some other doc)" | `[evidence: CI log 2026-06-02 exit 1]` |
| "Don't push to main" | "Never push to `main` — use a PR (lint blocks direct push)" |
| Long multi-line explanation | One line + link to topic file |

## Where in the File to Place the Section

- **Above**: any free-form notes, examples, or changelog.
- **Below**: any "Hard Rules" or "Prohibitions" section (so promotions flow naturally: `Learnings` → `Hard Rules`).
- **Not at the bottom**: bottom-of-file appends get lost in refactors (see anti-rationalization R2 in `../references/anti-rationalizations.md`).

## Companion Section: `## Hard Rules`

When a learning is verified across 3+ sessions, promote it from `## Learnings` to a hard-rule list. Example placement:

```markdown
## Hard Rules

- Never push to `main` directly. Branch + PR only.
- All API responses go through `src/lib/response.ts`.

## Learnings

> Persistent notes derived from agent sessions. ...

- **[2026-06-02]** Use `pnpm test --run` in CI — `[evidence: CI log exit 1]`
- **[2026-05-28]** `gh pr create` requires `--body-file`, not `--body` — `[evidence: gh CLI 2.49 deprecation]`
```

This is the same promotion pattern Anthropic's context-engineering guide recommends: warm learnings cool into rules, hot rules are enforced by hooks.

## Diff Preview (what the skill should produce)

```diff
 ## Project Conventions
 ...
+
+## Learnings
+
+> Persistent notes derived from agent sessions. Each row is a rule with evidence.
+> Auto-maintained by the `lz-session-learn` skill.
+
+- **[2026-06-02]** Use `pnpm test --run` in CI — `[evidence: CI log exit 1, fixed by adding --run]`
+- **[2026-06-02]** Never bypass the typecheck with `// @ts-ignore` — `[evidence: 2 prod incidents traced to this]`
```

If the user runs `/session-learn --dry-run`, show only this diff and wait for confirmation.
