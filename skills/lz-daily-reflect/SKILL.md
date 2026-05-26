---
name: lz-daily-reflect
description: "Create a daily reflection entry documenting work done, key findings, decisions, artifacts, blockers, and next steps. Use at the end of a work session or when the user says /daily-reflect. Supports two modes: project (default) and global."
---

# Daily Reflect

Create a daily reflection entry based on the work session that just finished or is currently in progress.

## Argument

If there is an argument after `/skill:lz-daily-reflect`, it determines the mode:

- **`global`** — Save to `~/.pi/daily-reflection/` (cross-project)
- **`project`** — (default) Save to `docs/daily-reflection/` in the current project
- **No argument** — Use `project` mode

## Modes & Locations

| Mode      | Root Directory              | Template          | Index         |
|-----------|-----------------------------|-------------------|---------------|
| `project` | `docs/daily-reflection/`    | `_template.md`    | `INDEX.md`    |
| `global`  | `~/.pi/daily-reflection/`   | `_template.md`    | `INDEX.md`    |

## Workflow

### 1. Determine Mode

Check user arguments:
- If `global` → global mode
- If `project` or no argument → project mode
- If `cwd` is not a recognized project and mode is project, fallback to global

### 2. Determine Root Directory

```bash
# Project mode
ROOT="docs/daily-reflection/"

# Global mode
ROOT="$HOME/.pi/daily-reflection/"
```

Ensure the directory, template (`_template.md`), and `INDEX.md` exist. If not, create them with minimal default content.

### 3. Collect Session Context

To fill the reflection, gather the following:

1. **What was done** — Scan recent files, git log, or ask the user
2. **Key findings** — New knowledge gained
3. **Decisions** — Architectural/design decisions made
4. **Artifacts** — Created/modified files (check git status or ls)
5. **Effort** — Ask user: time, energy, focus, satisfaction
6. **Blockers** — What hindered progress
7. **Next steps** — Action items for next session

Use these tools:
- `bash` with `git diff --name-only` for changed files
- `bash` with `git log --oneline -5` for recent commits
- `read` for relevant file content
- `ask_user` for human-judgment fields (effort, blockers)

### 4. Generate Filename

Format: `YYYY-MM-DD_<slug>.md`

```bash
DATE=$(date +%Y-%m-%d)
# Slug from session topic: lower case, replace spaces with hyphens
# Example: "Architecture Research" → "architecture-research"
```

If a file with the same name exists, add a numeric suffix:
- `2026-05-12_architecture-research.md`
- `2026-05-12_architecture-research-2.md`

### 5. Create Reflection Entry

Use `_template.md` as a guide. Fill all sections:

1. **Header** — Date, session title, agent, duration
2. **What I Did** — Bullet list of work done
3. **Key Findings** — Details with confidence levels and sources
4. **Decisions Made** — Decision table with rationale and alternatives
5. **Artifacts** — File table with actions and descriptions
6. **Effort** — Ask user (time, energy, focus, satisfaction)
7. **Blockers** — Current blockers
8. **Next Steps** — Action items checklist
9. **Notes** — Free-form reflections

> **IMPORTANT:** Do not just copy the template. Fill it with actual content based on gathered context. Remove HTML comments (`<!-- -->`) from the template.

### 6. Update INDEX.md

Add new entry to INDEX.md table:

```markdown
| {{NEXT_NUMBER}} | {{DATE}} | [`{{SLUG}}`](./{{FILENAME}}) | {{FOCUS}} | {{EFFORT}} | {{OUTCOME}} |
```

Update statistics section (total entries, date range, active days).

### 7. User Confirmation

Display summary:

```
✅ Reflection created: docs/daily-reflection/2026-05-12_architecture-research.md
📋 INDEX.md updated
⏱️ Effort: 4h | 🟢 High energy | 🟢 Deep focus
```

## Important Notes

- **Multiple entries per day allowed** — Use different slugs.
- **Honest documentation** — Include blockers and failed experiments.
- **Use ask_user** for subjective fields.
- **Do not modify template** — It is a structural reference.
- **Global mode** — Uses `$HOME/.pi/daily-reflection/` as root.
