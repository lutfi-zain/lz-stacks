<div align="center">

# 🛠️ lz-skill-forge

**Metadata Utility: Build & Discover Reusable AI Agent Skills**

[![Registry](https://img.shields.io/badge/skills.sh-indexed-blueviolet?style=for-the-badge&logo=vercel)](https://skills.sh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## Overview

A tooling utility designed to simplify skill creation and discovery in the open agent skills ecosystem. `lz-skill-forge` parses chat logs, highlights high-leverage repetition, and formats new skills into the standard `SKILL.md` layout with trigger-optimized metadata.

## How it Works

```mermaid
graph TD
    A[Scan Chat History] --> B[Cluster Repeated Tasks]
    B -->|Filter Bloat| C[Rank by ROI Leverage]
    C --> D[Generate SKILL.md Anatomy]
    D --> E[Write 5+ Trigger Keywords]
    
    style A fill:#10b981,color:#fff
    style B fill:#10b981,color:#fff
    style C fill:#f59e0b,color:#fff
    style D fill:#6366f1,color:#fff
    style E fill:#ef4444,color:#fff
```

## Absorbed Skills
Consolidates 2 meta-tooling draft skills:
- **skill-builder** → `references/skill-anatomy.md`
- **skill-opportunity-finder** → `references/opportunity-scanning.md`

## The Research

| Source | Concept | Application |
|---|---|---|
| Agent Skills Spec v1 | Trigger Optimization | Writing YAML metadata descriptions containing 5+ specific trigger phrases to maximize auto-invocation probability |
| Workspace Productivity Audit | Leverage-based Automation | Prioritizing workflows based on execution frequency multiplied by time saved |

## Install

```bash
npx skills add lutfi-zain/lz-stacks --skill lz-skill-forge
```
