<div align="center">

# 🧠 lz-quant-researcher

**Elite Quantitative Research Mindset & Workflow for AI Agents**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Registry](https://img.shields.io/badge/skills.sh-indexed-blueviolet?style=for-the-badge)](https://skills.sh)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Agent: Pi](https://img.shields.io/badge/Agent-Pi-orange?style=for-the-badge)](https://github.com/earendil-works/pi)
[![Agent: Claude Code](https://img.shields.io/badge/Agent-Claude_Code-7c58c3?style=for-the-badge)](https://github.com/anthropics/claude-code)

*Codifies how elite quants think — from radical skepticism to production deployment.*

</div>

---

## Overview

`lz-quant-researcher` is an agent skill that transforms AI coding assistants into rigorous quantitative research scientists. It doesn't just tell the agent *what to do* — it teaches *how to think* about markets, models, and uncertainty.

The skill combines:
- **Persona-driven radical skepticism** — the agent assumes the backtest is always lying
- **Derman's "models are metaphors" philosophy** — financial models are not physics
- **Production code patterns** — walk-forward validation, IC calculation, regime detection
- **Automated validation rules** — machine-readable anti-pattern detectors
- **Executable scripts** — `validate.py` scans quant code for common failures

## ⚡ Quick Install

```bash
npx skills add lutfi-zain/lz-stacks --skill lz-quant-researcher
```

---

## How it Works

The skill implements a 6-stage quantitative research workflow, each with specific validation gates:

```mermaid
flowchart TD
    A["🔍 Stage 1: Idea Generation"] --> B["📊 Stage 2: Signal Validation"]
    B -->|"IC > 0.03, IR > 0.7, t > 2.0"| C["⚙️ Stage 3: Backtesting"]
    B -->|"Fails thresholds"| A
    C -->|"Walk-forward passes"| D["🧩 Stage 4: Factor Decomposition"]
    C -->|"Fails walk-forward"| A
    D -->|"True alpha found (~5%)"| E["📋 Stage 5: Paper Trading"]
    D -->|"Just factor exposure"| A
    E -->|"6-12 months stable"| F["🚀 Stage 6: Live + Monitoring"]
    E -->|"Diverges from backtest"| A
    F -->|"Regime shift detected"| G{"Regime Detection"}
    G -->|"Adapt"| F
    G -->|"Halt"| H["⏸️ Strategy Paused"]

    style A fill:#1a1a2e,stroke:#e94560,color:#fff
    style B fill:#1a1a2e,stroke:#0f3460,color:#fff
    style C fill:#1a1a2e,stroke:#0f3460,color:#fff
    style D fill:#1a1a2e,stroke:#0f3460,color:#fff
    style E fill:#1a1a2e,stroke:#e94560,color:#fff
    style F fill:#16213e,stroke:#00b4d8,color:#fff
    style G fill:#533483,stroke:#e94560,color:#fff
    style H fill:#1a1a2e,stroke:#e94560,color:#fff
```

**Key insight:** Most strategies die between Stage 2 and Stage 4. The workflow is designed as a funnel — only ~5% of ideas survive to live trading.

---

## Skill Architecture

```
skills/lz-quant-researcher/
├── SKILL.md                         # Core skill: persona, philosophy, workflow
├── README.md                        # This file
├── references/
│   ├── patterns.md                  # Production Python: walk-forward, IC, stat arb, HMM
│   ├── sharp-edges.md               # 10 critical failure modes with detection/solutions
│   ├── validations.md               # 10 automated validation rules (regex + severity)
│   ├── mindset.md                   # Derman, Dalio, Kahneman, Taleb frameworks
│   └── risk-frameworks.md           # VaR, CVaR, Kelly, risk parity with Python code
├── scripts/
│   └── validate.py                  # Executable anti-pattern scanner for quant code
└── assets/
    └── backtest-checklist.md        # Pre/during/post backtest validation checklist
```

---

## The Research

This skill is grounded in primary sources from quantitative finance, behavioral economics, and the agent skills ecosystem:

| Source | Author(s) | Year | Contribution |
|--------|-----------|------|-------------|
| *Models.Behaving.Badly* | Emanuel Derman | 2011 | "Models are metaphors, not theories" — foundational philosophy |
| *Financial Modelers' Manifesto* | Derman & Wilmott | 2009 | The Modelers' Hippocratic Oath |
| *Active Portfolio Management* | Grinold & Kahn | 2000 | IC/IR framework, fundamental law of active management |
| *Principles: Life and Work* | Ray Dalio | 2017 | Systematic decision-making, risk parity, radical transparency |
| *Thinking, Fast and Slow* | Daniel Kahneman | 2011 | System 1/System 2 applied to trading decisions |
| *Antifragile* | Nassim Nicholas Taleb | 2012 | Building portfolios that gain from disorder |
| `quantitative-research` skill | omer-metin | 2025 | Persona-driven design, battle scars, reference file pattern |
| *QuantEvolve* (arXiv 2510.18569) | — | 2025 | Automated strategy discovery pipeline architecture |
| *Scientific Workflow for Alpha* | SetupAlpha | 2026 | IC validation and signal research methodology |
| *Quant Researcher Interview Guide* | G-Research | 2026 | What elite firms actually test for |

---

## Companion Skill

For general data science workflows (EDA, ML pipelines, A/B testing, stakeholder communication), use:

```bash
npx skills add lutfi-zain/lz-stacks --skill lz-data-science-core
```

---

<div align="center">
Built with 🧠 by <a href="https://github.com/lutfi-zain">Lutfi Zain</a>
</div>
