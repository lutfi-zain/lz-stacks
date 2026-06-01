# Target Detection

Picking the right destination is the most consequential decision in this skill. The wrong target means the learning either bloats a hot file (cost) or disappears into a cold file (no payoff). This reference is the decision tree.

> Research basis: amux's 2026 "Context Engineering for AI Coding Agents" surfaces six context surfaces with different cost / enforcement / scope profiles. Anthropic's "Effective context engineering for AI agents" (2025) formalizes compaction, memory, and structured notes. We map learnings to surfaces by **cost × signal × scope**.

## The Six Surfaces (Quick Map)

| Surface | Loaded | Cost per turn | Scope | Best for |
| --- | --- | --- | --- | --- |
| `CLAUDE.md` (project root) | Every session | **High** (full read) | Project | Hard rules, project conventions |
| `AGENTS.md` | First hit per agent (Claude fallback) | **High** (full read) | Cross-agent | Multi-tool standards (60K+ repos) |
| `MEMORY.md` (auto-memory) | Every session | **High** for first 200 lines / 25KB | Per-project | Index + recent corrections |
| Topic file (`MEMORY.md/.../foo.md`) | **On demand** | **Zero** until read | Per-project | Detailed notes, debugging recipes |
| `.claude/rules/*.md` | On path-match | **Zero** until matched | Per-glob | Stack-specific (e.g., `*.ts`) |
| Skill `SKILL.md` | On relevance match | **Zero** until activated | Cross-project | Reusable workflows |

**Default rule**: prefer the surface with the **lowest cost that still gets the rule read in the right contexts**. Topic files win on cost; project `CLAUDE.md` wins on enforcement.

## Detection Order (First Hit Wins)

Run these in order; the first match is the target.

```
1. User argument (`/session-learn claude`, `/session-learn memory`, etc.)
2. User in-prompt target ("add to CLAUDE.md", "log this in memory")
3. Auto-detect:
   a. ./CLAUDE.md exists          → CLAUDE.md
   b. ./AGENTS.md exists          → AGENTS.md
   c. ~/.claude/projects/<id>/memory/MEMORY.md exists → MEMORY.md
   d. None of the above            → ask_user (default: AGENTS.md)
```

Use these bash snippets for auto-detect:

```bash
# CLAUDE.md (root or .claude/)
test -f CLAUDE.md && echo CLAUDE.md
test -f .claude/CLAUDE.md && echo .claude/CLAUDE.md

# AGENTS.md
test -f AGENTS.md && echo AGENTS.md

# MEMORY.md (Claude Code auto-memory)
PROJ_ID=$(git rev-parse --show-toplevel 2>/dev/null | sed 's|/|_|g; s|^_||')
test -f "$HOME/.claude/projects/_$PROJ_ID/memory/MEMORY.md" \
  && echo "$HOME/.claude/projects/_$PROJ_ID/memory/MEMORY.md"
```

## The Decision Tree Per Learning Item

Once you know *which file family* to target, decide *where in the file*:

```
Is the rule a hard invariant (NEVER / ALWAYS)?
  ├── YES → CLAUDE.md or AGENTS.md, top "Hard Rules" or "Prohibitions" section
  └── NO ↓

Did the rule come from the user *this session* as a correction?
  ├── YES → MEMORY.md (auto-memory) — it's "feedback memory"
  └── NO ↓

Is the rule stack-specific (only relevant in /api, /web, *.ts)?
  ├── YES → .claude/rules/<glob>.md (path-scoped) OR per-package CLAUDE.md
  └── NO ↓

Is the rule detailed and > 3 lines of evidence?
  ├── YES → MEMORY.md topic file (e.g. debugging.md) + 1-line index entry in MEMORY.md
  └── NO → CLAUDE.md / AGENTS.md `## Learnings` (single row)
```

## Section Anchors (Reuse, Don't Invent)

Always anchor on an existing section when one exists. Standard section names that should exist on a healthy target file:

| File | Anchor | When to use |
| --- | --- | --- |
| `CLAUDE.md` | `## Hard Rules` | NEVER / ALWAYS invariants |
| `CLAUDE.md` | `## Corrections` or `## Learnings` | Session-derived rules |
| `AGENTS.md` | `## Security & Compliance Guardrails` | Negative constraints |
| `AGENTS.md` | `## Historical Session Learnings (Dynamic Log)` | Cross-agent notes |
| `MEMORY.md` | (top of file, after `## Project Memory`) | Recent corrections |
| `MEMORY.md` | `## [Topic]` followed by `[topic].md` link | Detailed notes |

**Never** invent: `## AI Learnings`, `## Agent Notes`, `## Session Insights`, `## Things to Remember`. Use `## Learnings` and update existing conventions. New section names fragment context and defeat the point.

## Compaction & Restart Survival

| Write target | Survives `/compact`? | Survives session restart? | Notes |
| --- | --- | --- | --- |
| Project-root `CLAUDE.md` | ✅ Re-read from disk | ✅ | Most durable surface |
| Nested `CLAUDE.md` | ❌ Not re-injected | ✅ | Use sparingly |
| `AGENTS.md` (root) | ✅ | ✅ | Cross-agent standard |
| `MEMORY.md` index | ✅ First 200 lines re-injected | ✅ | Use as a TOC |
| Topic file `MEMORY.md/.../foo.md` | ❌ Until re-read | ✅ | Cheap but not always loaded |
| Conversation only | ❌ Lost | ❌ | This is what the skill fixes |

> Source: Claude Code memory docs — *"Project-root CLAUDE.md survives compaction: after /compact, Claude re-reads it from disk and re-injects it into the session."*

## Multi-Agent Fleet Considerations

When the same `lz-session-learn` runs in parallel agents (e.g., 5 Claude sessions in 5 worktrees), the same `MEMORY.md` is **not** shared. This is a known limitation (per amux 2026):

- For per-agent learning → write to per-agent `MEMORY.md` (default).
- For fleet-wide invariant → write to project-root `CLAUDE.md` or `AGENTS.md` so all agents see it.
- For shared, mutable state across agents → use a REST API / board, not the filesystem (out of scope for this skill).

## When to Ask the User

Ask **once**, with a clear default, when:

- All four auto-detect checks fail (no `CLAUDE.md`, no `AGENTS.md`, no `MEMORY.md`).
- The user gave a *category* ("log this somewhere") but not a file.
- The signal strength is ambiguous between hard rule and soft note.

Never ask the user twice in one run of the skill. The exit checklist requires resolution.

## References

- amux (2026), *Context Engineering for AI Coding Agents: The Complete Guide* — six-surface model.
- Anthropic (2025), *Effective context engineering for AI agents* — memory, compaction, structured notes.
- Claude Code memory docs — auto-memory, MEMORY.md, topic file semantics.
- [Agentic AI Foundation / Linux Foundation] — `AGENTS.md` ecosystem standard (60K+ repos).
