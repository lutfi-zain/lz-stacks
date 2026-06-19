# 10 Families — Deep Documentation

## 1. Smoothing / Moving Averaging

**Math:** Convolution of price with weighting function.

All MA variants differ only in shape of weighting function. Fundamental trade-off: smoothness vs lag. Better smoothing = more lag.

**Non-adaptive lineage:** SMA (uniform) → WMA (linear) → EMA (exponential, recursive) → DEMA = 2×EMA−EMA² (negative weights on lags, less lag) → TEMA = 3×EMA−3×EMA²+EMA³ (even less lag) → ZLEMA = EMA(2P−P[lag]) → Hull = WMA(2×WMA(n/2)−WMA(n), √n) (nonlinear)

**Adaptive lineage:** KAMA (alpha via Efficiency Ratio = |direction|/|volatility|) → FRAMA (period via Hurst exponent) → MAMA (alpha via Hilbert Transform phase rate — fast attack, slow decay like sample-and-hold)

**Implementation tips:**

- Start with KAMA for general purpose. Upgrade to MAMA for low-lag requirement.
- DEMA/TEMA: responsive but noisy in choppy markets
- Hull MA: good balance but complex weight structure
- Fixed MA (SMA/EMA) as fallback baseline only

## 2. Digital Signal Filtering

**Math:** Isolate frequency bands. Price = superposition of cycles.

- Low-Pass: pass trends (long cycles), attenuate noise (short cycles)
- High-Pass: pass momentum (short cycles), remove trends (long cycles)
- Band-Pass: pass specific cycle range (e.g., 30-70 bars). MACD = BP (difference of 2 LPs)

**Filter designs (classical analog-digital):**

- Butterworth: maximally flat passband, no ripple, nonlinear phase. General purpose.
- Chebyshev I: sharper cutoff, ripple in passband
- Chebyshev II: flat passband, ripple in stopband
- Elliptic (Cauer): sharpest cutoff, ripple in BOTH bands
- Bessel: linear phase (preserves waveform shape), worst rolloff

**IIR vs FIR:** IIR recursive, efficient, can be unstable (EMA). FIR non-recursive, always stable, more taps (SMA).

**Ehlers Swiss Army Knife:** One filter structure configurable as EMA, SMA, Butterworth, FIR smoother, Bandpass, Bandstop.

**Critical caveat:** Financial data is non-stationary. Fixed-parameter filters fail long-term.

## 3. Regression / Curve Fitting

**Math:** Fit curve, deviation = signal.

- Linear Regression Channel: y=mx+b, bands = ±kσ. Trend direction + dynamic S/R
- Polynomial MRB: degree 2-4 polynomials. Nasda100 backtest shows profitability but overfitting risk high with degree>4
- RANSAC: robust to outliers, iteratively fits random subsets
- Regularized: Ridge (L2), LASSO (L1), Elastic Net (L1+L2), MCP/SCAD (non-convex). Automatically select useful features. MCP achieved 73.2% accuracy on Google trend prediction — outperforming SVM (68.6%) and ANN (72.9%)

**Implementation:** Use polynomial degree ≤4. Always cross-validate. LASSO/MCP for feature selection when feeding many indicators.

## 4. Spectral Analysis / Cycle Detection

**Math:** Decompose signal into frequency components.

- FFT: needs many cycles for resolution. Poor for finance.
- MESA (Maximum Entropy Spectral Analysis): Ehlers' breakthrough. Works with short noisy data. Outputs dominant cycle period.
- Hilbert Transform: extract instantaneous amplitude + phase. MAMA uses phase rate-of-change for alpha adaptation.
- EMD (Empirical Mode Decomposition): data-driven, no fixed basis. Decomposes into IMFs. Detects cycle AND trend mode.
- Wavelet: time-frequency simultaneously. Handles non-stationarity. MRA decomposes into approximation (low-freq) + details (high-freq). Wavelet entropy = crisis indicator.

**Which to use:** Wavelet for multi-scale analysis. MESA for real-time dominant cycle detection. EMD for adaptive decomposition.

## 5. Fractal / Hurst

**Math:** H exponent: H=0.5 random walk, H>0.5 persistent trending, H<0.5 anti-persistent mean-reverting.

**Estimation:** R/S analysis (original), DFA (better for non-stationarity), DWT (frequency combination), Generalized Hurst (multifractal).

**Practical:** Moving Hurst (rolling window H) backtested to outperform MACD in some markets. FRAMA = adaptive MA using Hurst-derived fractal dimension.

## 6. GARCH Family

**Math:** σ²_t = ω + α·ε²_{t−1} + β·σ²_{t−1}. ω = long-run variance, α = reaction to shock, β = persistence. α+β ≈ 1 = highly persistent volatility clustering.

**Variants:** EGARCH (log variance — leverage effect), GJR-GARCH (indicator-based asymmetry), IGARCH (integrated), FIGARCH (long memory), Component GARCH.

**Does NOT predict direction.** Predicts uncertainty. Use for: position sizing, volatility entries, regime classification.

## 7. Entropy / Information Theory

**Math:** H(X) = −Σ p(x)·log₂(p(x)). High = random/unpredictable, Low = ordered/predictable.

**Types:** Shannon (basic), Approximate Entropy ApEn (0=deterministic, 2=random — market efficiency measure), Permutation (ordinal patterns, robust to noise), KL Divergence (detect regime changes via distribution shift), Transfer Entropy (detect lead-lag between series).

**Implementation:** Combine Hurst + Entropy + Price Efficiency Ratio → composite regime classifier (trending/random/mean-reverting). Available as TradingView indicator.

## 8. Chaos / Nonlinear Dynamics

**Math:** Lyapunov exponent λ > 0 = chaotic. Typical λ ≈ 0.44 in markets.

**Techniques:** Lyapunov (measure instability — spikes pre-crash), Correlation Dimension (fractal complexity), Phase Space Reconstruction (Takens' theorem — visualize attractor from single series).

**Evidence controversial.** Markets may exhibit intermittent chaos. Don't build standalone strategy on chaos alone.

## 9. Bayesian Probabilistic

**Math:** Hidden states with transition probabilities + emission distributions.

- HMM: probabilistic regime (72% bull, 20% chop, 8% bear). Uses Forward algorithm. Weakness: lags regime changes by several bars.
- Kalman Filter: linear Gaussian. Pairs trading, spread estimation. Adjusts gain adaptively.
- Particle Filter (SMC): nonlinear, non-Gaussian. Handles jumps, fat tails. Computationally expensive. HFT use.
- AH-HMM: 2-layer (states + meta-regimes). Captures how switching changes during uncertainty.
- Statistical Jump Model (JM): outperforms HMM (44% vs 141% turnover, better Sharpe). Consider JM over HMM for practical trading.

## 10. ML Hybrids

**Principle:** Model learns optimal combination of multiple principles.

- Autoencoder + CNN + GAN: denoise → spatial features → augmentation. Outperforms GARCH/Z/OC-SVM for anomaly detection.
- LSTM-CNN: indicators → images → CNN → LSTM → forecast. Captures temporal + spatial.
- Clustering (K-means/Hierarchical/GMM): flexible regime detection. No Markov assumption.
- HMM → RL (PPO/SAC): regime features as RL state. Outperforms pure RL in backtests.

**Implementation:** Best for feature extraction regimes. Not for interpretable goals.
