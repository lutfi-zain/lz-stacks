---
name: lz-technical-indicator-architect
description: >-
  10 statistical families behind technical indicators: smoothing, filtering,
  regression, spectral, fractal, GARCH, entropy, chaos, Bayesian, ML-hybrid.
  Use when designing, evaluating, or combining indicators — picking which
  family to use, understanding trade-offs (lag vs smoothness vs adaptivity),
  or implementing indicator with sound statistical foundation. Triggers:
  "tambah indicator", "compare MA", "indicator principle", "statistical,
  smoothing, filtering", "indicator design, "buat indicator", "indicator
  development", "HMM, entropy, wavelet, GARCH, Hurst".
license: MIT
metadata:
  author: lutfi-zain
  version: "1.0.0"
  based-on: deep-research report 2026-06-19
---

## What this skill provides

Complete taxonomy of all statistical principles behind technical indicators.
Every indicator from SMA to HMM regime detection belongs to exactly one of
10 families. Each family has distinct math, trade-offs, and use cases.

## The 10 Families Quick Reference

| # | Family | Principle | Indicator Examples |
|---|--------|-----------|-------------------|
| 1 | **Smoothing** | Convolution with weighting scheme | SMA, EMA, DEMA, TEMA, Hull, KAMA, FRAMA, MAMA |
| 2 | **Filtering** | Isolate frequency band of signal | Butterworth LP/HP/BP, Ehlers Supersmoother |
| 3 | **Regression** | Fit curve to price, deviation = signal | LinearReg Channel, Polynomial MRB, RANSAC, LASSO |
| 4 | **Spectral** | Decompose price into frequency components | MESA, FFT, Hilbert Transform, Wavelet, EMD |
| 5 | **Fractal** | Measure long-term memory & self-similarity | Hurst Exponent, DFA, FRAMA, MFDFA |
| 6 | **GARCH** | Model time-varying conditional variance | GARCH(1,1), EGARCH, GJR-GARCH, IGARCH |
| 7 | **Entropy** | Measure uncertainty & information content | Shannon Entropy, ApEn, Permutation Entropy, KL |
| 8 | **Chaos** | Detect deterministic nonlinear dynamics | Lyapunov Exponent, Phase Space Reconstruction |
| 9 | **Bayesian** | Infer hidden states from observations | HMM, Kalman Filter, Particle Filter, AH-HMM |
| 10 | **ML Hybrid** | Learned combinations of principles | LSTM-CNN, Autoencoder+GAN, Clustering+RL |

## When to Use Which Family

- **Smoothing** → menginginkan trend dengan berbagai tingkat responsivitas.
  Trade-off: smoothness vs lag. Adaptive MA (KAMA/MAMA) > fixed MA.
- **Filtering** → spesifik ingin isolasi cycle length tertentu.
  Low-pass = trend. High-pass = momentum. Band-pass = cycle.
- **Regression** → ingin "fair value" reference line + confidence bands.
  Polynomial untuk non-linear patterns. LASSO/MCP untuk auto feature selection.
- **Spectral** → ingin detect dominant cycle period (feed ke indicator lain).
  Wavelet: non-stationary data. MESA: short data. Hilbert: instantaneous phase.
- **Fractal** → ingin tahu apakah market trending (H>0.5) atau mean-reverting (H<0.5).
- **GARCH** → ingin model/prediksi volatility. BUKAN untuk direction prediction.
- **Entropy** → ingin measure market efficiency / randomness.
  High entropy = no edge. Low entropy = structured opportunity.
- **Chaos** → ingin measure instability / crash risk. Evidence controversial.
- **Bayesian** → ingin probabilistic regime classification (e.g., 72% bull).
  HMM + RL hybrid outperform pure RL. But HMM lags — consider Jump Models.
- **ML Hybrid** → ingin model belajar kombinasi terbaik secara otomatis.
  Autoencoder for denoising, LSTM for temporal, clustering for regime.

## The 4-Layer Development Framework

```
Layer 1: INPUT PROCESSING
  Denoising (Wavelet, Kalman) → Normalization (Z-score) → Features (returns)

Layer 2: CORE PRINCIPLE (pick 1-2 families from the 10 above)

Layer 3: SIGNAL GENERATION
  Threshold | Crossover | Probability | Divergence | Composite scoring

Layer 4: VALIDATION
  Walk-forward | Out-of-sample | Monte Carlo | Regime-aware | Sensitivity
```

## Design Principles

1. **Composable** — principles stack and combine
2. **Parameter-aware** — document sensitivity and optimal ranges
3. **Regime-aware** — indicator must know current market mode
4. **Adaptive** — fixed params underperform. Adaptive params more robust.
5. **Parsimonious** — simplest principle that captures the edge

## Critical Contradictions & Caveats

- **DSP cycle filters**: theory is strong, independent backtests are mixed.
  Use as measurement tools (provide cycle period), not standalone signals.
- **HMM lag**: HMM needs several bars before switching states. Statistical Jump
  Models (JM) beat HMM: 44% vs 141% turnover, better Sharpe. Always combine
  regime signals with other indicators, don't rely on them alone.
- **Chaos theory**: evidence for deterministic chaos in markets is mixed.
  Markets likely exhibit intermittent chaos — not purely deterministic.
- **Backtest reliability**: most DSP papers use limited out-of-sample.
  True OOS performance is worse. Always walk-forward + regime-aware eval.

## Hard Rules

- Never use fixed-parameter DSP as standalone signal generator. Use it as
  adaptive parameter provider (measure cycle → feed to separate trading logic).
- Never rely on single-family indicator. Combine 2+ principles.
- Always include adaptive variant when implementing smoothing/filtering.
- Always document parameter sensitivity and optimal ranges.

## References

Reference files are loaded on demand. Depth goes: family details → lineage →
framework.

- `./references/families.md` — Deep docs for all 10 families with advantages,
  disadvantages, implementation guidance, and math.
- `./references/lineage.md` — Evolution tree (SMA → EMA → DEMA → KAMA → MAMA)
  plus DSP filter comparison table (Butterworth vs Chebyshev vs Elliptic).
- `./references/framework.md` — Complete 4-layer development framework, best
  practices untuk setiap family, common pitfalls, test methodology.
