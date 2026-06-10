---
name: lz-humanizer-pro
description: >
  Bilingual (English + Indonesian) AI text detection and humanization.
  Scans for 35+ AI writing patterns using 700+ vocabulary terms across 5
  categories and statistical analysis (burstiness, TTR, MATTR, hapax ratio,
  n-gram repetition). Detects AI text in both English and Indonesian.
  Rewriting framework uses the 5-layer system (sentence variation, tone,
  emotional depth, flow, deliberate imperfections). Use when you need to
  score, analyze, or humanize text in either language. Covers content,
  language, style, communication, and filler categories.
license: MIT
---

# lz-humanizer-pro — Bilingual AI Text Humanizer

Combines the best of `humanizer` (29 English pattern detectors, composite scoring) and `lz-humanizer` (5-layer Indonesian rewriting framework) into one bilingual engine.

## Quick Start

```bash
# Score text (0-100, higher = more AI-like)
echo "Your text here" | node src/cli.js score
echo "Teks Anda di sini" | node src/cli.js score --lang id

# Full analysis
node src/cli.js analyze -f file.txt --lang id

# Humanize with auto-fixes
node src/cli.js humanize --autofix -f article.txt --lang id

# Scan directory
node src/cli.js scan docs --ext md --lang id
```

## Architecture

```
Input (EN or ID)
    │
    ▼
language.js ── auto-detect OR --lang flag
    │
    ├── [EN] ───► vocabulary.js (500+ EN words)
    │             patterns.js (29 EN detectors)
    │             stats.js (burstiness, TTR, MATTR, hapax)
    │             analyzer.js → Composite Score (0-100)
    │             humanizer.js → EN rewrite suggestions
    │
    ├── [ID] ───► vocabulary-id.js (200+ ID words)
    │             patterns-id.js (8+ ID detectors)
    │             stats.js (same stats engine — language agnostic)
    │             analyzer.js → Composite Score (0-100)
    │             humanizer-id.js → 5-layer ID rewrite framework
    │
    ▼
CLI: score | analyze | humanize | suggest | stats | scan
```

## Commands

| Command | Description |
|---------|-------------|
| `score` | Quick score (0-100) |
| `analyze` | Full analysis with pattern matches |
| `humanize` | Rewrite suggestions + optional auto-fix |
| `suggest` | Issues grouped by priority |
| `stats` | Statistical analysis only |
| `scan` | Analyze multiple files |

### Options

| Flag | Description |
|------|-------------|
| `--lang en\|id` | Force language (auto-detect default) |
| `--json` | JSON output |
| `--verbose, -v` | Show all matches |
| `--autofix` | Apply safe mechanical fixes |
| `--ignore-code` | Skip code blocks |
| `--ignore-quotes` | Skip quoted blocks |
| `--threshold <n>` | Only show weight >= n |
| `--patterns <ids>` | Only check specific pattern IDs |
| `--file, -f` | Read from file (else stdin) |

## Statistical Signals

| Metric | Human | AI | Why |
|--------|-------|----|-----|
| Burstiness | 0.5-1.0 | 0.1-0.3 | Humans write in bursts |
| Type-token ratio | 0.5-0.7 | 0.3-0.5 | AI reuses vocabulary |
| MATTR | 0.7-0.9 | 0.5-0.7 | Moving average TTR |
| Hapax legomena | 0.5-0.7 | 0.3-0.5 | Unique words used once |
| Sentence CoV | 0.4-0.8 | 0.15-0.35 | Length variation |
| Trigram repetition | <0.05 | >0.10 | 3-word phrase reuse |
| Conjunction start | >15% | <8% | Sentences starting w/ And/But/So |
| 1st-person pronoun | >3% | <1% | "I", "we", "my" usage |

## 5-Layer Rewriting Framework (Indonesian)

When humanizing Indonesian text, the engine applies:

1. **Sentence structure variation** — mix short/long, fragments
2. **Conversational tone & word choice** — replace formal with daily words
3. **Emotional depth & personal voice** — opinion markers, hedges
4. **Natural flow & jargon removal** — short paragraphs, casual transitions
5. **Deliberate imperfections** — mid-thought clarifications, mild grammar looseness

## Vocabulary Tiers

### English (500+ words)
- **Tier 1 (Dead giveaways):** delve, tapestry, vibrant, showcase, seamless, groundbreaking...
- **Tier 2 (Suspicious in density):** furthermore, moreover, leverage, utilize, paradigm...
- **Tier 3 (Context-dependent):** significant, effective, diverse, key, vital, notable...

### Indonesian (200+ words)
- **Tier 1 (Dead giveaways):** memanfaatkan, sinergi, optimalisasi, transformasi, lanskap...
- **Tier 2 (Suspicious in density):** terdepan, inovatif, implementasi, efisien, fasilitasi...
- **Tier 3 (Context-dependent):** penting, menarik, utama, signifikan, besar...

## References

- [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) — baseline pattern catalog
- [Copyleaks stylistic fingerprint analysis](https://arxiv.org/abs/2503.01659) — stylometric features
- [Tarım & Onan, arXiv 2507.10475](https://arxiv.org/abs/2507.10475) — diffusion vs autoregressive text
- [brandonwise/humanizer](https://github.com/brandonwise/humanizer) — English detection engine
- [Kerangka Humanisasi ID](./references/humanize_framework_id.md) — 5-layer framework
- [Contoh & Pengujian ID](./references/humanize_examples_testing_id.md) — test cases
