<div align="center">

# ⚡ lz-stacks
**Premium AI Agent Skills for the Open Ecosystem**

[![Registry](https://img.shields.io/badge/skills.sh-indexed-blueviolet?style=for-the-badge&logo=vercel)](https://skills.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Agent: Pi](https://img.shields.io/badge/Agent-Pi-orange?style=for-the-badge)](https://github.com/earendil-works/pi)
[![Agent: Claude Code](https://img.shields.io/badge/Agent-Claude_Code-7c58c3?style=for-the-badge)](https://github.com/anthropics/claude-code)

[Explore Skills](#-available-skills) • [Installation](#-installation) • [Contributing](#-contributing)

</div>

---

## ⚡ Quick Install

```bash
npx skills add lutfi-zain/lz-stacks
```

Or a single skill:

```bash
npx skills add lutfi-zain/lz-stacks --skill lz-session-learn
npx skills add lutfi-zain/lz-stacks --skill lz-daily-reflect
npx skills add lutfi-zain/lz-stacks --skill lz-create-agentsmd
```

---

## 🚀 Overview

`lz-stacks` is a collection of high-performance, specialized skills for AI coding agents. Compatible with **pi**, **Claude Code**, and any agent supporting the [Agent Skills specification](https://agentskills.io).

---

## 🧩 Available Skills

| Skill | Description | Command |
| :--- | :--- | :--- |
| [**lz-session-learn**](./skills/lz-session-learn/SKILL.md) | Reflective session memory — distills the current session into durable `CLAUDE.md` / `AGENTS.md` / `MEMORY.md` entries using a 5-phase Read–Write reflective loop. | `/skill:lz-session-learn` |
| [**lz-daily-reflect**](./skills/lz-daily-reflect/SKILL.md) | Smart daily work reflections with project context. | `/skill:lz-daily-reflect` |
| [**lz-create-agentsmd**](./skills/lz-create-agentsmd/SKILL.md) | Interactive AGENTS.md generator for pi. | `/skill:lz-create-agentsmd` |

---

## 📦 Installation

Install globally or into your current project using `skills.sh`:

### 1. Global Installation
```bash
npx skills add lutfi-zain/lz-stacks
```

### 2. Specific Skill Installation
```bash
npx skills add lutfi-zain/lz-stacks --skill lz-session-learn
npx skills add lutfi-zain/lz-stacks --skill lz-daily-reflect
npx skills add lutfi-zain/lz-stacks --skill lz-create-agentsmd
```

---

## 🛠 Usage in Agents

### Pi Agent
```bash
/skill:lz-daily-reflect
```

### Claude Code
```bash
/lz-daily-reflect
```

---

## 🤝 Contributing

1. Fork the repo
2. Create your skill folder in `skills/`
3. Add a `SKILL.md` following the [spec](https://agentskills.io/specification)
4. Submit a PR!

---

<div align="center">
Built with ❤️ by <a href="https://github.com/lutfi-zain">Lutfi Zain</a>
</div>
