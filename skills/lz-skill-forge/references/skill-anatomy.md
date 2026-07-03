# Skill Anatomy & Design Rules

A reference on trigger optimization and layout rules for constructing standard agent skills.

## 1. Trigger Optimization (The Description)
The `description` field in the YAML frontmatter is the single most important element of a skill. The host agent reads this description to determine whether to load the skill on-demand.

### Rules for Description Writing:
- **Length:** Under 1,024 characters.
- **Specific Keywords:** Include at least 5 distinct trigger terms or slash commands (e.g., *"/build-skill"*, *"package workflow"*, *"create skill"*).
- **Instructional Tone:** Direct the agent on when it must load the skill.
- **YAML Escape:** Quote the description with `>` if it contains a colon (`:`), hashtag (`#`), or other special characters to avoid parsing errors.

---

## 2. Standard Markdown Layout
All skills must contain these sections:
- `# Title`: A human-readable heading.
- `## When to Use`: Clear, bulleted conditions showing the agent when to execute this skill.
- `## Inputs`: Required context or documents.
- `## Output Structure`: Markdown blueprint of what the skill outputs.
- `## Process`: Sequential step-by-step instructions.
- `## Critical Rules`: Absolute constraints and anti-patterns (e.g., *"never invent metrics"*).

---

## 3. General Best Practices
- **kebab-case name:** The `name` frontmatter field must match the directory name exactly and use lowercase, numbers, and hyphens only.
- **Keep it under 500 lines:** Avoid placing massive datasets or templates inside `SKILL.md`. Push them to `references/` or `assets/` folders instead.
- **Local Validation:** Always safe-load the YAML frontmatter using a validator script before committing.
- **Differentiate:** Scan existing skills to avoid duplicating triggers.
