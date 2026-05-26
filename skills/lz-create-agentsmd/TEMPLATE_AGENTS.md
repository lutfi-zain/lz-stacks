# AGENTS.md

**Repository:** `[Repo Name]`
**Domain:** `[Brief Domain Description]`

This file is the authoritative guide for AI coding agents working in this repository. It defines the layered architecture, code style rules, testing requirements, and hard constraints that every change must satisfy.

---

## Commands

```bash
# [Inject Test Command Here]
```

Run all tests and confirm they pass before finalising any change.

---

## Project Context & Business Domain (DDD)

**Ubiquitous Language:**
- **[Term 1]:** [Definition]
- **[Term 2]:** [Definition]

Ensure all variable names, database columns, and API responses strictly adhere to this ubiquitous language.

---

## Architecture Boundaries (Progressive Disclosure)

Logic flows strictly according to the defined architectural patterns. 

For the canonical implementation patterns, refer to these Gold Standard files:
- **[Pattern 1]:** [[Filename]](file:///[Path])
- **[Pattern 2]:** [[Filename]](file:///[Path])

*Agents: Do not hallucinate structural patterns. Read the Gold Standard files before creating new components.*

---

## Security & Compliance Guardrails

- **[Negative Constraint 1]**
- **[Negative Constraint 2]**

---

## Git & Workflow Conventions

- **Branching Strategy:** [e.g., Use feature/JIRA-123 for branches]
- **Pushing Rules:** [e.g., Never force push; always rebase first]
- **Commit Format:** [e.g., Conventional Commits required]

---

## Dependencies & Environment

- **[Dependency Rule 1]**
- **[Dependency Rule 2]**

---

## Historical Session Learnings (Dynamic Log)

*When you consistently fail at a specific architectural nuance or encounter a repeating edge-case, add a note here to prevent future agents from making the same mistake.*

- [Log Entry 1]
