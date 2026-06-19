# lz-technical-indicator-architect — Statistical Architect for Technical Indicators

[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![Research](https://img.shields.io/badge/sources-65-orange)]()

**10 statistical families** behind every technical indicator, from SMA to HMM.
Agent learns the trade-offs (smoothing vs lag, adaptivity vs complexity) and
knows exactly which family to use for any indicator task.

## How It Works

```mermaid
flowchart LR
    A["User asks:<br/>'smoothing indicator'"] --> B["SKILL.md<br/>scans 10 families"]
    B --> C["Matches: Family 1<br/>Smoothing / MA"]
    C --> D["references/lineage.md<br/>SMA → EMA → KAMA → MAMA"]
    C --> E["references/families.md<br/>Trade-offs, math, examples"]
    B --> F["Framework references<br/>4-layer development pipeline"]
    F --> G["Composable indicator design"]
    style B fill:#2d6a4f,color:#fff
    style C fill:#1e3a5f,color:#e8e4de
    style D fill:#b8860b,color:#fff
    style E fill:#b8860b,color:#fff
    style F fill:#0e7490,color:#fff
```

## The Research

Based on exhaustive survey of 65 sources including:

- Lo, Mamaysky, Wang (2000). *Foundations of Technical Analysis*. Journal of Finance. — the seminal paper bridging statistical inference and technical patterns.
- Feng & Palomar (2016). *A Signal Processing Perspective on Financial Engineering*. Foundations and Trends in Signal Processing. — the definitive DSP-finance crossover.
- Ehlers, J. (2001–2025). *MESA Adaptive Moving Averages* and 20+ technical papers. — the pioneer of DSP-based indicators.
- Jiang et al. (2022). *Penalized Logistic Regressions with Technical Indicators*. PMC. — demonstrates auto-selection of indicators via MCP/SCAD regularization.

Full source table available in research report `tmp/research_statistical-principles-technical-indicators_20260619.md`.

## Skill Structure

```
skills/lz-technical-indicator-architect/
├── SKILL.md                  <200 lines — quick reference + triggers
├── README.md                 this file
├── references/
│   ├── families.md           Deep docs for 10 families (math, implementation)
│   ├── lineage.md            Moving average evolution tree + filter comparison
│   └── framework.md          4-layer development pipeline + best practices
```

## Usage

Trigger: mention indicator design, smoothing, filtering, regression, spectral,
fractal, GARCH, entropy, HMM, wavelet, or related terms.

Agent then loads SKILL.md → identifies family → loads relevant reference file
for deep implementation guidance.
