# AGENTS.md

**Repository:** `lz-stacks`
**Domain:** AI agent skill registry (markdown-only)

This file is the authoritative guide for AI coding agents working in this repository. It is intentionally compact — the only "code" here is the contents of `SKILL.md` files, so most engineering boilerplate does not apply.

---

## What this repo is

A collection of [Agent Skills](https://agentskills.io/specification), distributed via `npx skills add lutfi-zain/lz-stacks`. **There is no application code, no build, no test, no lint, no typecheck, and no CI.** Do not invent any.

---

## Layout

```
skills/
└── <skill-name>/
    ├── SKILL.md           # Required. YAML frontmatter + workflow body.
    ├── README.md          # Optional. Recommended for new skills.
    ├── references/        # Optional. Deep docs, loaded on demand.
    └── assets/            # Optional. Templates, checklists.
```

- One folder per skill, named exactly like the skill's `name` frontmatter field.
- Skill folders are siblings; skills do not import each other at runtime.

---

## Hard Rules (will fail review if violated)

These come from the [Agent Skills specification v1](https://agentskills.io/specification). A new skill that breaks any of these will be rejected upstream.

- `name`: 1–64 chars; `a-z`, `0-9`, `-` only; must not start or end with `-`; **must match parent directory name**.
- `description`: 1–1024 chars; must state **what** the skill does **and when** to use it (include trigger keywords the agent can match on).
- **Quote the `description` in YAML** if it contains a colon, hash, or other YAML-special character. (See commit `9f97d51` for the prior breakage this caused.)
- Use the `lz-` prefix for any new skill in this repo.
- `SKILL.md` body should stay under 500 lines; push detail into `references/` or `assets/`.
- All file references from `SKILL.md` must be one level deep (e.g. `./references/x.md`, not `./references/sub/x.md`).
- Do not invent new top-level section names in other skills' files (e.g. `## AI Learnings`). Reuse `## Learnings`, `## Hard Rules`, `## Corrections`, `## Historical Session Learnings`.

---

## Commands

There are no project commands. For local sanity-check of a new skill (no validator is currently wired in CI):

```bash
# YAML + spec checks the lz-session-learn skill uses internally
python3 -c "
import yaml, re, sys
fm = yaml.safe_load(open('skills/<name>/SKILL.md').read().split('---')[1])
assert re.fullmatch(r'[a-z0-9]([a-z0-9-]{0,62}[a-z0-9])?', fm['name']), 'bad name'
assert len(fm['description']) <= 1024, 'description too long'
assert fm['name'] == '<name>', 'name must match dir'
print('OK')
"
```

To install a skill from this repo globally for manual testing:

```bash
npx skills add lutfi-zain/lz-stacks --skill <name> -g
```

---

## When you add a new skill

1. Create `skills/<name>/SKILL.md` with valid frontmatter (see Hard Rules).
2. Add a `README.md` inside the skill folder. The emerging convention in this repo is: research-backed prose, badges, a mermaid diagram in `How it Works`, and a `## The Research` table citing at least one primary source where applicable.
3. Register the new skill in the root `README.md` **Available Skills** table. Order: newest first.
4. Verify the new skill's internal `./references/` and `./assets/` links all resolve to real files.
5. Commit. No version bump, no changelog file — this repo has none.

---

## Conventions

- **Commit style:** sentence-case imperative subject, one line for the headline, optional body explaining why. Examples from history: `Add lz-session-learn skill…`, `Simplify Mermaid diagram…`, `Adopt research README…`.
- **Frontmatter metadata:** newer skills (e.g. `lz-session-learn`) include a `metadata:` block listing research papers. This is encouraged but not enforced.
- **PR / branch / release policy:** none defined. Solo project. Don't invent one in a PR.

---

## Things explicitly NOT in this repo

Do not propose adding any of these — they have been deliberately omitted:

- `package.json`, lockfile, or any build manifest
- `.github/workflows/`, `Makefile`, or any task runner
- Pre-commit hooks, formatters, linters
- Tests (the spec is validated by hand on PR review)
- `CHANGELOG.md`, versioning, semver tags
- License files beyond the top-level MIT declaration in each skill's frontmatter

---

## Self-references

- The `lz-create-agentsmd` skill can regenerate this file from scratch (3-phase workflow: AST scan → user interview → template inject).
- The `lz-session-learn` skill can append per-session learnings under a `## Learnings` anchor without overwriting existing content.
- See [Agent Skills specification](https://agentskills.io/specification) for the full format this repo conforms to.
