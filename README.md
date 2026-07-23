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
npx skills add lutfi-zain/lz-stacks --skill lz-linkedin-carousel
npx skills add lutfi-zain/lz-stacks --skill lz-visual-forge
npx skills add lutfi-zain/lz-stacks --skill lz-content-engine
npx skills add lutfi-zain/lz-stacks --skill lz-youtube-engine
npx skills add lutfi-zain/lz-stacks --skill lz-skill-forge
npx skills add lutfi-zain/lz-stacks --skill lz-quant-researcher
npx skills add lutfi-zain/lz-stacks --skill lz-data-science-core
npx skills add lutfi-zain/lz-stacks --skill lz-humanizer-pro
npx skills add lutfi-zain/lz-stacks --skill lz-humanizer
npx skills add lutfi-zain/lz-stacks --skill lz-session-learn
npx skills add lutfi-zain/lz-stacks --skill lz-daily-reflect
npx skills add lutfi-zain/lz-stacks --skill lz-create-agentsmd
npx skills add lutfi-zain/lz-stacks --skill lz-create-youtube-abstracts
npx skills add lutfi-zain/lz-stacks --skill lz-kairos-debugger
npx skills add lutfi-zain/lz-stacks --skill lz-pr-review
npx skills add lutfi-zain/lz-stacks --skill lz-technical-indicator-architect
```

---

## 🚀 Overview

`lz-stacks` is a collection of high-performance, specialized skills for AI coding agents. Compatible with **pi**, **Claude Code**, and any agent supporting the [Agent Skills specification](https://agentskills.io).

---

## 🧩 Available Skills

| Skill | Description | Command |
| :--- | :--- | :--- |
| [**lz-linkedin-carousel**](./skills/lz-linkedin-carousel/README.md) | High-engagement B2B LinkedIn PDF carousel copywriting and visual design system based on Notion, Stripe, and Elastic aesthetics. | `/skill:lz-linkedin-carousel` |
| [**lz-visual-forge**](./skills/lz-visual-forge/README.md) | Programmatic visual content generator for social media graphics, carousels, covers, YouTube thumbnails, and pitch decks from React JSX code using Vercel Satori and Resvg. | `/skill:lz-visual-forge` |
| [**lz-content-engine**](./skills/lz-content-engine/README.md) | Unified content creation and design engine for social media — LinkedIn, Twitter/X, and Instagram. Built around the 30-day playbook, visual systems, and platform playbooks. | `/skill:lz-content-engine` |
| [**lz-youtube-engine**](./skills/lz-youtube-engine/README.md) | Unified YouTube pipeline — ideation (search vs browse), packaging (pairing principle), outlines (retention structure), and long-to-short repurposing. | `/skill:lz-youtube-engine` |
| [**lz-skill-forge**](./skills/lz-skill-forge/README.md) | Meta-utility to discover repeated workflows across conversations and package them into standard, trigger-optimized agent skills. | `/skill:lz-skill-forge` |
| [**lz-kairos-debugger**](./skills/lz-kairos-debugger/README.md) | Enterprise-grade AWS ECS/CloudWatch root-cause investigation — 11 mandatory rules from real incident feedback, adaptive RCA, digital forensics, change analysis, architectural tracing, and Mermaid sequence diagrams for Kairos (HIS/PAS/PAY) microservices. | `/skill:lz-kairos-debugger` |
| [**lz-pr-review**](./skills/lz-pr-review/README.md) | Six-phase PR review — business intent → requirements → code comprehension → best practices (PERFECT rubric) → clarifying Q&A gate → visual report with mermaid diagrams, severity classification, and quoted code suggestions. | `/lz-pr-review` |
| [**lz-technical-indicator-architect**](./skills/lz-technical-indicator-architect/README.md) | Design technical indicators from 10 statistical families — smoothing, filtering, regression, spectral, fractal, GARCH, entropy, chaos, Bayesian, ML-hybrid. Pick principle, understand trade-offs, compose with sound foundation. | `/skill:lz-technical-indicator-architect` |
| [**lz-quant-researcher**](./skills/lz-quant-researcher/README.md) | Elite quant research mindset & workflow — persona-driven radical skepticism, Derman's philosophy, walk-forward validation, factor decomposition, regime detection. Includes production Python patterns, automated validation rules, and executable code scanner. | `/skill:lz-quant-researcher` |
| [**lz-data-science-core**](./skills/lz-data-science-core/README.md) | Strategic data scientist mindset & CRISP-DM workflow — first-principles thinking, EDA patterns, experiment design (A/B testing, causal inference), stakeholder communication, and executable data quality auditor. | `/skill:lz-data-science-core` |
| [**lz-humanizer-pro**](./skills/lz-humanizer-pro/README.md) | Bilingual AI Text Humanizer (EN+ID) — detects AI writing patterns, scores text 0-100, humanizes with 5-layer framework. Includes CLI, 37 pattern detectors, 700+ vocabulary terms. | `/skill:lz-humanizer-pro` |
| [**lz-humanizer**](./skills/lz-humanizer/SKILL.md) | AI Text Humanizer (ID) — converts AI-sounding text into natural, human-written prose while preserving facts and structures. | `/skill:lz-humanizer` |
| [**lz-session-learn**](./skills/lz-session-learn/README.md) | Reflective session memory — distills the current session into durable `CLAUDE.md` / `AGENTS.md` / `MEMORY.md` entries using a 5-phase Read–Write reflective loop. | `/skill:lz-session-learn` |
| [**lz-daily-reflect**](./skills/lz-daily-reflect/SKILL.md) | Smart daily work reflections with project context. | `/skill:lz-daily-reflect` |
| [**lz-create-agentsmd**](./skills/lz-create-agentsmd/README.md) | Interactive AGENTS.md generator for pi. | `/skill:lz-create-agentsmd` |
| [**lz-create-youtube-abstracts**](./skills/lz-create-youtube-abstracts/SKILL.md) | Create academic abstract/summary from YouTube video transcripts in Bahasa Indonesia. Includes auto-fetch, overlap merge, and humanization. | `/skill:lz-create-youtube-abstracts` |

---

## 📦 Installation

Install globally or into your current project using `skills.sh`:

### 1. Global Installation

```bash
npx skills add lutfi-zain/lz-stacks
```

### 2. Specific Skill Installation

```bash
npx skills add lutfi-zain/lz-stacks --skill lz-linkedin-carousel
npx skills add lutfi-zain/lz-stacks --skill lz-content-engine
npx skills add lutfi-zain/lz-stacks --skill lz-youtube-engine
npx skills add lutfi-zain/lz-stacks --skill lz-skill-forge
npx skills add lutfi-zain/lz-stacks --skill lz-quant-researcher
npx skills add lutfi-zain/lz-stacks --skill lz-data-science-core
npx skills add lutfi-zain/lz-stacks --skill lz-humanizer-pro
npx skills add lutfi-zain/lz-stacks --skill lz-humanizer
npx skills add lutfi-zain/lz-stacks --skill lz-session-learn
npx skills add lutfi-zain/lz-stacks --skill lz-daily-reflect
npx skills add lutfi-zain/lz-stacks --skill lz-create-agentsmd
npx skills add lutfi-zain/lz-stacks --skill lz-create-youtube-abstracts
npx skills add lutfi-zain/lz-stacks --skill lz-technical-indicator-architect
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
