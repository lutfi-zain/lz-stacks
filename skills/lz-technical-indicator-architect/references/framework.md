# 4-Layer Development Framework

```
Layer 1: INPUT PROCESSING     ← always
Layer 2: CORE PRINCIPLE       ← pick 1-2 families
Layer 3: SIGNAL GENERATION    ← choose signal type
Layer 4: VALIDATION           ← always, exhaustive
```

## Layer 1: Input Processing

- Denoising: Wavelet DWT (non-stationary data), Kalman (real-time), Supersmoother (replaces MA)
- Normalization: Z-score (mean 0, std 1), Min-Max [0,1], Rank (percentile)
- Features: returns → log returns → range (H−L) → volatility → ratios

**Rule of thumb:** Always denoise before feeding indicators. Wavelet for multi-scale, Kalman for real-time.

## Layer 2: Core Principle Selection

Combine families for robustness. Good pairs:

- Smoothing + GARCH: trend + volatility regime
- Spectral + Bayesian: cycle detection → HMM regime
- Fractal + Entropy: long memory + information content
- Filtering + ML Hybrid: DSP features → learned model

**Bad combinations:** Two families that do same thing (e.g., Smoothing + Filtering both isolate trend — redundant). Always ensure orthogonality.

## Layer 3: Signal Generation

- Threshold: fast/slow thresholds (RSI >70/<30). Clear but noisy.
- Crossover: fast crosses slow (MA crossover). Standard.
- Probability: regime probability >80% (HMM). Confidence-aware.
- Divergence: price makes HH but indicator makes LH. Reversal signal.
- Composite: weighted/scored combination across families. Most robust.

**Composite scoring pattern:**

```
score = w1 × signal₁ + w2 × signal₂ + w3 × signal₃
signal = ≥threshold? Confirm. <threshold? Neutral.
```

Adjust weights per market regime (use HMM or Hurst to decide weights).

## Layer 4: Validation

Test methodology order:

1. **Walk-forward**: rolling train/test windows. Don't use simple train/test split.
2. **Out-of-sample**: final unseen period (at least 20% of data)
3. **Monte Carlo**: randomize entry timing, test robustness
4. **Regime-aware**: run backtest separately on bull/bear/chop. If indicator only works in bull, flag it.
5. **Parameter sensitivity test**: vary each parameter ±20%, check performance variance. High variance = fragile.

**Required metrics:** Sharpe, Max Drawdown, Calmar Ratio, Win Rate, Profit Factor, Avg Trade. Separate by long/short and regime.

## Common Pitfalls

- Overlapping train/test (look-ahead bias fatal)
- Optimizing parameters on full sample (data snooping)
- Using same period for Hurst/cycle detection and backtest (circular reasoning)
- Assuming HMM regimes are tradable (they lag — add confirmation filter)
- DSP filter with fixed params on non-stationary data (decays quickly)

## Best Practice per Family

| Family | Implementation Guidance |
|--------|----------------------|
| Smoothing | Always use adaptive (KAMA). Fallback to fixed only for baseline. |
| Filtering | Measure dominant cycle first, tune filter to it. |
| Regression | Degree ≤4. Cross-validate. LASSO for feature selection. |
| Spectral | Wavelet for analysis. MESA for real-time. EMD for adaptive. |
| Fractal | DFA over R/S. Rolling window with overlap. |
| GARCH | GJR-GARCH for leverage effect. Not for direction. |
| Entropy | Permutation Entropy for speed. KL Divergence for regime change. |
| Chaos | Don't build strategy on it. Use as risk overlay. |
| Bayesian | Consider Jump Models over HMM. Always add lag compensation. |
| ML Hybrid | Autoencoder denoising is safe. Full hybrid only with enough data. |
