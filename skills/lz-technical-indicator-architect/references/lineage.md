# Moving Average Lineage

```
SMA (uniform weights, FIR)
 └─→ WMA (linear weights, recent heavier)
      └─→ EMA (exponential decay, IIR)
           ├─→ DEMA = 2×EMA − EMA(EMA)
           │    [negative weights on lagged prices → less lag]
           ├─→ TEMA = 3×EMA − 3×EMA² + EMA³
           │    [even less lag, but noisier]
           └─→ ZLEMA = EMA(2×price − price[lag])
                └─→ Hull MA = WMA(2×WMA(n/2) − WMA(n), √n)
                     [nonlinear combination, low lag]
```

**Adaptive variants branch from EMA:**

```
EMA alpha (fixed)
 ├─→ KAMA alpha = [ER×(fast−slow)+slow]²
 │    ER = |P−P[n]| / Σ|P−P[1bar]|  (Efficiency Ratio)
 ├─→ FRAMA period = log(Hurst)/log(2)
 │    Hurst via DFA on windowed price
 └─→ MAMA alpha via Hilbert Transform
      phase rate → fast attack + slow decay
```

## DSP Filter Comparison

| Criterion | Butterworth | Chebyshev I | Chebyshev II | Elliptic | Bessel |
|-----------|:-----------:|:-----------:|:------------:|:--------:|:------:|
| Passband ripple | None | Yes | None | Yes | None |
| Stopband ripple | None | None | Yes | Yes | None |
| Rolloff sharpness | Moderate | Good | Good | Best | Worst |
| Phase linearity | Moderate | Poor | Moderate | Poor | Best |
| Finance use | General | Sharp cutoff needed | Rare | Rare | Waveform preservation |

## IIR vs FIR

| Aspect | IIR | FIR |
|--------|:---:|:---:|
| Structure | Recursive (feedback) | Non-recursive (feedforward) |
| Stability | Can be unstable | Always stable |
| Efficiency | Fewer taps | More taps needed |
| Phase | Nonlinear | Can be linear |
| Examples | EMA, Butterworth IIR | SMA, Weighted MA |

## Adaptive vs Fixed: When to Use

- **Fixed MA** (SMA/EMA): baseline, comparative benchmarks only
- **KAMA**: general trend following. Adapts to volatility well.
- **FRAMA**: when market exhibits clear fractal structure
- **MAMA**: when lag minimization is critical (short-term trading)
- **Butterworth LP**: when frequency isolation precision matters
- **Ehlers Supersmoother**: cleaner than MA, but requires warmup
