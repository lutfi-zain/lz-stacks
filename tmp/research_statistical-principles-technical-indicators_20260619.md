# Statistical Principles Behind Technical Indicators: A Comprehensive Taxonomy

**Date:** 2026-06-19
**Depth:** exhaustive
**Confidence:** 88%
**Sources:** 65 sources from 5 search rounds

---

## Executive Summary

Technical indicators bukan sekadar "tambah ini tambah itu" — mereka semua berakar pada **10 families statistik/mathematical principles** yang bisa dikategorikan secara rigor. Tiga yang user sudah kenal (smoothing, filtering, regression) hanyalah permukaan. Di bawahnya ada **7 families lainnya** yang sama powerful-nya: spectral analysis, fractal/hurst, volatility clustering (GARCH), information theory (entropy), nonlinear dynamics (chaos), Bayesian probabilistic (HMM/particle filter), dan machine learning hybrids. Setiap family punya prinsip matematika yang berbeda, trade-off yang berbeda, dan use case yang berbeda. Framework ini bisa menjadi fondasi untuk skill develop technical indicator berbasis statistik.

---

## Key Findings

1. **Semua technical indicators bisa direduksi ke 10 families statistik** — bukan 3. Yang biasa dikenal (smoothing, filtering, regression) adalah surface level. [Robot Wealth DSP](https://robotwealth.com/using-digital-signal-processing-in-quantitative-trading-strategies), [Feng & Palomar 2016](https://palomar.home.ece.ust.hk/papers/2016/Feng&Palomar-FnT2016.pdf)
2. **Moving average variants (SMA→EMA→DEMA→TEMA→HMA→ALMA→KAMA→MAMA) punya lineage matematika yang jelas** — dari simple convolution ke adaptive nonlinear filter. [Zakamulin 2024](https://alphaarchitect.com/trend-following-valeriy-zakamulin-types-moving-averages-part-2), [MQL5 Comparison](https://www.mql5.com/en/articles/3791)
3. **DSP filters (Butterworth, Chebyshev, wavelet) secara teori lebih unggul dari MA tradisional** — tapi practically menghadapi non-stationarity problem. [Robot Wealth](https://robotwealth.com/using-digital-signal-processing-in-quantitative-trading-strategies)
4. **HMM regime detection menunjukkan promise tapi punya inherent lag** — Statistical Jump Models bisa jadi upgrade. [LSEG Study](https://developers.lseg.com/en/article-catalog/article/market-regime-detection)
5. **Information theory (Shannon entropy) bisa measure market efficiency** — entropy tinggi = random = tidak ada edge, entropy rendah = structured = ada opportunity. [PapersWithBacktest](https://paperswithbacktest.com/course/entropy-features)
6. **GARCH family bukan indicator tradisional tapi fundamental principle** — volatility clustering adalah stylized fact #1 di financial markets. [QuantInsti](https://blog.quantinsti.com/garch-gjr-garch-volatility-forecasting-python)
7. **Ehlers' DSP approach paling inovatif tapi juga paling controversial** — backtest results mixed, tapi sebagai measurement tool (bukan signal generator) sangat valuable. [Better System Trader Interview](https://bettersystemtrader.com/048-john-ehlers)

---

## Detailed Analysis

### Q1: Apa saja families/paradigma statistik yang mendasari technical indicators?

Setiap technical indicator yang pernah dibuat, dari SMA sederhana sampai HMM regime detection, bisa direduksi ke salah satu dari **10 families statistik**. Ini bukan taxonomy yang ditemukan di satu paper saja, tapi hasil synthesis dari literatur DSP, financial engineering, dan quantitative finance.

**The 10 Families:**

| # | Family | Prinsip Inti | Contoh Indicators |
|---|--------|-------------|-------------------|
| 1 | **Smoothing / Moving Averaging** | Rata-rata bergerak dengan berbagai weighting scheme | SMA, EMA, WMA, DEMA, TEMA, Hull, ALMA |
| 2 | **Digital Signal Filtering** | Isolasi frequency band tertentu dari price signal | Butterworth LP/HP/BP, Supersmoother, Ehlers filters |
| 3 | **Regression / Curve Fitting** | Fit mathematical curve ke price data | Linear Regression Channel, Polynomial Regression, RANSAC |
| 4 | **Spectral Analysis / Cycle Detection** | Decompose price ke komponen frekuensi | MESA, FFT-based, Autocorrelation Periodogram, Hilbert Transform |
| 5 | **Fractal / Hurst Analysis** | Measure long-term memory & self-similarity | Hurst Exponent, Fractal Dimension, R/S Analysis, DFA |
| 6 | **Volatility Clustering (ARCH/GARCH)** | Model time-varying conditional variance | GARCH, EGARCH, GJR-GARCH, IGARCH |
| 7 | **Information Theory / Entropy** | Measure uncertainty & information content | Shannon Entropy, Permutation Entropy, Approximate Entropy |
| 8 | **Nonlinear Dynamics / Chaos** | Detect deterministic chaos dalam apparent randomness | Lyapunov Exponent, Correlation Dimension, Phase Space Reconstruction |
| 9 | **Bayesian Probabilistic** | Infer hidden states dari observables | HMM, Particle Filter, Kalman Filter, Bayesian Regime Switching |
| 10 | **Machine Learning Hybrids** | Combine multiple principles via learned representations | Autoencoder features, LSTM signals, CNN-LSTM, Clustering-based regime |

**Cross-reference:** Family 1-3 adalah "classical" yang paling dikenal trader. Family 4-6 adalah "quantitative" yang mulai populer di hedge funds. Family 7-10 adalah "modern" yang masih di frontier research.

---

### Q2: Prinsip di balik Smoothing / Moving Average Variants

**Prinsip fundamental:** Moving average adalah **convolution** — kamu multiply price data dengan weighting function, lalu sum. Perbedaan antara SMA, EMA, WMA, dll hanyalah bentuk weighting function-nya.

**Lineage matematika:**

```
SMA (uniform weights)
 └─→ WMA (linear weights, recent = lebih berat)
      └─→ EMA (exponential weights, recursive)
           ├─→ DEMA = 2×EMA - EMA(EMA)  [subtract lag]
           ├─→ TEMA = 3×EMA - 3×EMA(EMA) + EMA(EMA(EMA))
           └─→ ZLEMA = EMA(2×price - price[lag])  [zero-lag concept]
                └─→ Hull = WMA(2×WMA(n/2) - WMA(n), √n)  [nonlinear combination]
```

**Key insight dari literatur:**

- Semua MA variants berusaha menyelesaikan **trade-off fundamental**: smoothness vs lag. Better smoothing = lebih banyak lag. [Zakamulin, Alpha Architect](https://alphaarchitect.com/trend-following-valeriy-zakamulin-types-moving-averages-part-2)
- DEMA/TEMA menggunakan **negative weights** pada price lags — ini yang bikin mereka lebih responsif tapi juga lebih noise. [StockCharts TEMA](https://chartschool.stockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/triple-exponential-moving-average-tema)
- **Adaptive MAs** (KAMA, FRAMA, MAMA) berusaha solve ini dengan mengubah alpha secara dinamis berdasarkan market condition. [Thinkorswim AMA](https://toslc.thinkorswim.com/center/reference/Tech-Indicators/studies-library/M-N/MovAvgAdaptive)

**KAMA (Kaufman Adaptive):** Menggunakan Efficiency Ratio = |net direction| / |total volatility| untuk adjust speed. High ER (trending) → fast response. Low ER (choppy) → slow response. [Thinkorswim](https://toslc.thinkorswim.com/center/reference/Tech-Indicators/studies-library/M-N/MovAvgAdaptive)

**FRAMA (Fractal Adaptive):** Menggunakan Hurst exponent untuk adjust period secara adaptif berdasarkan fractal dimension. [Ehlers, MESA Software](https://www.mesasoftware.com/TechnicalArticles.htm)

**MAMA (MESA Adaptive):** Paling sophisticated — menggunakan Hilbert Transform untuk measure instantaneous phase, lalu adjust alpha berdasarkan phase rate of change. Fast attack, slow decay — seperti sample-and-hold circuit. [Ehlers 2001](http://traders.com/documentation/feedbk_docs/2001/09/Abstracts_new/Ehlers/ehlers.html)

---

### Q3: Prinsip di balik Filtering Approaches

**Prinsip fundamental:** Filtering = **isolasi frequency band** dari signal. Harga financial adalah superposition dari cycles berbagai frequency. Filter memilih cycle mana yang mau di-pass dan mana yang di-attenuate.

**Tiga tipe filter:**

- **Low-Pass (LP):** Pass long cycles (trends), attenuate short cycles (noise). SMA adalah LP filter. [Robot Wealth](https://robotwealth.com/using-digital-signal-processing-in-quantitative-trading-strategies)
- **High-Pass (HP):** Pass short cycles (momentum), attenuate long cycles (trends). RSI konsepnya mirip HP. [Robot Wealth](https://robotwealth.com/using-digital-signal-processing-in-quantitative-trading-strategies)
- **Band-Pass (BP):** Pass cycles dalam range tertentu. MACD = difference of two LP filters = effectively a BP filter. [Alpha Architect DSP](https://alphaarchitect.com/an-introduction-to-digital-signal-processing-for-trend-following)

**Filter design families:**

- **Butterworth:** Maximally flat passband, no ripple. Phase response nonlinear. Cocok untuk general purpose. [MathWorks](https://www.mathworks.com/help/signal/ug/practical-introduction-to-digital-filter-design.html)
- **Chebyshev Type I:** Sharper cutoff tapi ada ripple di passband. [MathWorks](https://www.mathworks.com/help/signal/ug/practical-introduction-to-digital-filter-design.html)
- **Chebyshev Type II:** Maximally flat passband, ripple di stopband. [MathWorks](https://www.mathworks.com/help/signal/ug/practical-introduction-to-digital-filter-design.html)
- **Elliptic (Cauer):** Sharpest cutoff, ripple di passband DAN stopband. [Analog Devices](https://www.analog.com/media/en/training-seminars/design-handbooks/mixedsignal_sect6.pdf)
- **Bessel:** Maximally flat group delay (linear phase). Best untuk preserving waveform shape. [Analog Devices](https://www.analog.com/media/en/training-seminars/design-handbooks/mixedsignal_sect6.pdf)

**IIR vs FIR:**

- **IIR (Infinite Impulse Response):** Recursive, lebih efficient, tapi bisa unstable. EMA adalah IIR. [Alpha Architect](https://alphaarchitect.com/an-introduction-to-digital-signal-processing-for-trend-following)
- **FIR (Finite Impulse Response):** Non-recursive, selalu stable, tapi butuh lebih banyak taps. SMA adalah FIR. [Alpha Architect](https://alphaarchitect.com/an-introduction-to-digital-signal-processing-for-trend-following)

**Ehlers' approach:** Mengembangkan "Swiss Army Knife Indicator" — satu filter structure yang bisa jadi EMA, SMA, Butterworth, FIR smoother, Bandpass, atau Bandstop hanya dengan mengubah constants. [Ehlers, MESA Software](https://www.mesasoftware.com/TechnicalArticles.htm)

**The critical problem:** Financial time series **non-stationary** — mean dan variance berubah-ubah. Fixed-parameter filters tidak akan perform well sepanjang waktu. Solusi: adaptive filters yang modify coefficients over time. [Alpha Architect DSP](https://alphaarchitect.com/an-introduction-to-digital-signal-processing-for-trend-following)

---

### Q4: Prinsip di balik Regression-Based Indicators

**Prinsip fundamental:** Fit mathematical curve ke price data, gunakan curve sebagai "fair value" reference. Deviation dari curve = signal.

**Linear Regression Channel:**

- Fit line y = mx + b ke N data points menggunakan least squares
- Upper/lower bands = ±k standard deviations dari regression line
- Regression line = trend direction, bands = dynamic support/resistance
- [TrendSpider Guide](https://trendspider.com/learning-center/a-comprehensive-guide-to-linear-regression-for-traders-and-investors)

**Polynomial Regression:**

- Extend linear regression dengan terms x², x³, x⁴ untuk capture non-linear patterns
- Polynomial MRB (Moving Regression Band) system tested on Nasdaq100: degree 2-4 polynomials with 2σ bands generate profitable automated trading. [Nguyen 2024, MDPI Risks](https://www.mdpi.com/2227-9091/12/10/166)
- Risk: overfitting tinggi dengan degree tinggi. Mitigasi: early stopping, lower-degree polynomials.

**RANSAC (Random Sample Consensus):**

- Robust regression yang tahan outliers — cocok untuk financial data yang punya fat tails
- Secara iteratif fit model ke subset random data, reject outliers
- TradingView punya RANSAC indicators [TradingView Scripts](https://in.tradingview.com/scripts/ransac)

**Regularized Regression (Ridge, LASSO, Elastic Net, MCP, SCAD):**

- Gunakan penalty functions untuk prevent overfitting dan feature selection
- MCP logistic regression dengan 19 technical indicators achieves 73.2% accuracy on Google stock trend prediction — outperforms SVM, ANN, dan standard logistic regression. [Jiang et al. 2022, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC9379894)
- Key insight: penalized regression bisa **automatically select** which technical indicators are actually useful.

---

### Q5: Apa lagi selain Smoothing, Filtering, Regression?

#### Family 4: Spectral Analysis / Cycle Detection

**Prinsip:** Decompose price signal ke komponen frekuensi menggunakan Fourier Transform atau variant-nya. Setiap cycle punya period, frequency, amplitude, dan phase.

**MESA (Maximum Entropy Spectral Analysis):**

- Ehlers' key contribution — works better than FFT untuk short, noisy data
- FFT butuh banyak cycles untuk high resolution. MESA bisa estimate spectrum dari sedikit data points. [Better System Trader Interview](https://bettersystemtrader.com/048-john-ehlers)
- Output: dominant cycle period → feed ke adaptive indicators

**Hilbert Transform:**

- Extract instantaneous amplitude dan phase dari signal
- Digunakan untuk calculate instantaneous frequency = 1/dominant cycle
- MAMA indicator berbasis ini. [Ehlers 2001](http://traders.com/documentation/feedbk_docs/2001/09/Abstracts_new/Ehlers/ehlers.html)

**Empirical Mode Decomposition (EMD):**

- Novel approach dari Ehlers — decompose signal ke Intrinsic Mode Functions (IMFs)
- Bisa detect both cycle mode dan trend mode secara simultaneous
- [Ehlers, MESA Software](https://www.mesasoftware.com/TechnicalArticles.htm)

**Wavelet Transform:**

- Decompose signal di **both time AND frequency domain** secara simultaneous
- Kelebihan: handles non-stationary data (yang Fourier tidak bisa)
- Multi-Resolution Analysis (MRA): decompose ke approximation (low-freq) dan detail (high-freq) components [MDPI Applied Sciences](https://www.mdpi.com/2076-3417/9/7/1345)
- Wavelet families: Haar, Daubechies, Symmlet, Coiflets — pilih tergantung characteristics data [CMP Publisher](https://cmpublisher.com/wavelet-transforms-in-financial-time-series-analysis-a-review-on-stock-price-prediction)
- **Wavelet entropy:** Combine wavelet decomposition dengan entropy measure → powerful crisis indicator [CEUR-WS](https://ceur-ws.org/Vol-2713/paper40.pdf)

#### Family 5: Fractal / Hurst Analysis

**Prinsip:** Measure **long-term memory** dan **self-similarity** dalam time series.

**Hurst Exponent (H):**

- H = 0.5: Random walk (no memory)
- H > 0.5: Persistent (trend-following works) — positive autocorrelation
- H < 0.5: Anti-persistent (mean-reversion works) — negative autocorrelation
- [Kroha & Skoula 2018, SCITEPRESS](https://www.scitepress.org/papers/2018/66670/66670.pdf)

**Estimation methods:**

- Rescaled Range (R/S) — original method by Hurst
- Detrended Fluctuation Analysis (DFA) — handles non-stationarity better
- Discrete Wavelet Transform — combines with frequency analysis
- Generalized Hurst Exponent — captures multifractality
- [arXiv 2310.19051](https://arxiv.org/html/2310.19051v3)

**Practical indicator:** Moving Hurst (MH) — rolling window Hurst calculation. Backtested to outperform MACD in some markets. [Kroha & Skoula](https://www.scitepress.org/papers/2018/66670/66670.pdf)

**FRAMA (Ehlers):** Moving average yang adaptif berdasarkan Hurst-derived fractal dimension. [Ehlers, MESA Software](https://www.mesasoftware.com/TechnicalArticles.htm)

#### Family 6: Volatility Clustering (GARCH)

**Prinsip:** Volatility **cluster** — period of high vol diikuti high vol, low vol diikuti low vol. Ini adalah **stylized fact #1** di financial markets, pertama kali dideskripsikan oleh Mandelbrot 1963. [Cont et al.](http://rama.cont.perso.math.cnrs.fr/pdf/clustering.pdf)

**GARCH(1,1):**

```
σ²_t = ω + α·ε²_{t-1} + β·σ²_{t-1}
```

- ω = long-run average variance component
- α = reaction to recent shock (ARCH term)
- β = persistence of past volatility (GARCH term)
- α + β close to 1 = highly persistent volatility clustering [Engle, NYU Stern](https://www.stern.nyu.edu/rengle/GARCH101.PDF)

**EGARCH:** Log variance model — captures **leverage effect** (negative shocks increase vol more than positive shocks). [QuantInsti](https://blog.quantinsti.com/garch-gjr-garch-volatility-forecasting-python)

**GJR-GARCH:** Alternative leverage model using indicator function:

```
σ²_t = ω + α·ε²_{t-1} + γ·ε²_{t-1}·I_{t-1} + β·σ²_{t-1}
```

Where I = 1 if previous return was negative. [QuantInsti](https://blog.quantinsti.com/garch-gjr-garch-volatility-forecasting-python)

**Other variants:** IGARCH (integrated, persistent), FIGARCH (long memory), Component GARCH, APARCH. [Medium: Volatility Modeling](https://medium.com/@simomenaldo/volatility-modeling-a-deep-dive-into-the-arch-family-f361bafbb3f7)

**As indicator principle:** GARCH forecasts bukan predict direction, tapi **predict uncertainty**. Useful untuk: position sizing, volatility-based entries, regime classification.

#### Family 7: Information Theory / Entropy

**Prinsip:** Measure **uncertainty** dan **information content** dalam price distribution.

**Shannon Entropy:**

```
H(X) = -Σ p(xᵢ) · log₂(p(xᵢ))
```

- H tinggi = returns spread across many bins = chaotic, unpredictable
- H rendah = returns cluster in few bins = ordered, predictable
- [PapersWithBacktest](https://paperswithbacktest.com/course/entropy-features)

**Approximate Entropy (ApEn):**

- Range 0-2: 0 = perfectly deterministic, 2 = complete randomness
- Efficient indicator of market efficiency — higher ApEn = more random = less predictable
- [PMC 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9073522)

**Permutation Entropy:**

- Captures ordinal patterns in time series
- Robust to noise, computationally efficient
- [Springer 2026](https://link.springer.com/article/10.1007/s10614-026-11347-2)

**Practical use:** TradingView indicator yang combine Hurst + Shannon Entropy + Price Efficiency Ratio — gives regime classification (trending/random/mean-reverting) via composite score. [TradingView Entropy Scripts](https://my.tradingview.com/scripts/entropy)

**KL Divergence:** Detect regime changes by measuring distributional shift. Superior to traditional volatility-based methods. [arXiv 2511.16339](https://arxiv.org/html/2511.16339v1)

#### Family 8: Nonlinear Dynamics / Chaos

**Prinsip:** Market movements mungkin apparent random tapi sebenarnya **deterministic chaos** — sensitive to initial conditions tapi bounded dalam strange attractor.

**Lyapunov Exponent (λ):**

- λ > 0: Chaotic — small changes → exponential divergence
- λ < 0: Stable — system converges
- Typical value in financial markets: ~0.44 [Pariona, 2025](https://dialnet.unirioja.es/descarga/articulo/10524220.pdf)
- Used to detect market crashes — spike in Lyapunov pre-crash. [CEUR-WS 2020](https://ceur-ws.org/Vol-2732/20200455.pdf)

**Fractal Dimension:** Measures complexity of price trajectory. Combined with Lyapunov → powerful nonlinear analysis toolkit. [MQL5 Chaos Theory](https://www.mql5.com/en/articles/15332)

**Phase Space Reconstruction:** Reconstruct attractor dari single time series using Takens' theorem (time delay embedding). Enables visualization of market dynamics in 2D/3D. [Hsieh, Duke](https://people.duke.edu/~dah7/jf1991.pdf)

**Practical caveat:** Evidence for chaos in financial markets is **mixed**. Some studies find positive Lyapunov exponents, others don't. The truth likely lies in between — markets may exhibit intermittent chaos. [Herho 2026, CODEE Journal](https://scholarship.claremont.edu/codee/vol20/iss1/1)

#### Family 9: Bayesian Probabilistic

**Prinsip:** Model market sebagai **hidden state process** — states tidak observable, hanya output-nya yang terlihat. Infer probabilities of each state.

**Hidden Markov Model (HMM):**

- States: hidden regimes (Bull/Bear/Chop/Crash)
- Observables: returns, volatility, momentum
- Transition matrix: probability of switching states
- Emission probabilities: what observable looks like in each state
- [LuxAlgo HMM](https://www.luxalgo.com/library/indicator/hidden-markov-model-market-regimes)

**HMM strength:** Provides probabilistic confidence — not just "bull" or "bear" but "72% bull, 20% chop, 8% bear". [TradingView HMM Enhanced](https://www.tradingview.com/script/iF0ZwCVf-HMM-Enhanced-Regime-Probability)

**HMM weakness (critical):** Lagged regime identification. HMM needs several bars of evidence before switching states. During rapid regime changes (crashes), it's often too slow. Statistical Jump Models (JM) outperform HMMs with 44% turnover vs 141% and better Sharpe ratios. [LSEG Study](https://developers.lseg.com/en/article-catalog/article/market-regime-detection), [arXiv JM vs HMM](https://arxiv.org/html/2402.05272v2)

**Kalman Filter:** Linear Gaussian state-space model. Estimates true price dari noisy observations. [QuantStart](https://www.quantstart.com/articles/hidden-markov-models-an-introduction)

- Used in pairs trading: estimate spread, detect mean-reversion
- Adaptive: adjusts Kalman gain based on innovation sequence

**Particle Filter (Sequential Monte Carlo):** Nonlinear, non-Gaussian extension of Kalman filter. Maintains set of "particles" (hypotheses) and weights them. [DayTrading.com](https://www.daytrading.com/particle-filtering-hft)

- Can handle regime switching, jump processes, fat tails
- Computationally expensive — mainly used in HFT

**Adaptive Hierarchical HMM (AH-HMM):** Two-layer HMM — inner states (bull/bear/turbulent) + outer meta-regimes (low-uncertainty/high-uncertainty). Captures how the switching process itself changes during uncertainty. [MDPI JRFM 2025](https://www.mdpi.com/1911-8074/19/1/15)

#### Family 10: Machine Learning Hybrids

**Prinsip:** Combine multiple statistical principles via **learned representations** — let the model figure out which combination works.

**Autoencoder + CNN + GAN:**

- Denoising autoencoder removes noise → CNN extracts spatial features → GAN augments training data
- Outperforms GARCH, Z-Score, One-Class SVM for anomaly detection across all asset classes [OpenAccess Publishers](https://www.opastpublishers.com/open-access-articles/robust-anomaly-detection-in-financial-markets-using-lstm-autoencoders-and-generative-adversarial-networks-9525.html)

**LSTM-CNN Hybrid:**

- LSTM captures temporal dependencies (long-term trends)
- CNN captures spatial features from technical indicator matrices
- Technical indicators (SMA, EMA, BB, RSI, MACD, OBV) → transformed into images → CNN processes → LSTM sequences [MDPI JRFM](https://www.mdpi.com/1911-8074/18/4/201)

**Clustering-based Regime Detection:**

- K-means, Hierarchical Clustering, GMM on multivariate market features
- More flexible than HMM (no Markov assumption required)
- GitHub repos: MarketRegimeNet, regime-aware-spy-overlay, CLUSTERING-MARKET-REGIMES [GitHub Topics](https://github.com/topics/market-regime)

**Key hybrid pattern:** HMM regime detection → feed regime as feature → RL agent (PPO/SAC) for optimal action. This outperforms pure RL in some backtests. [Cloud-Conf 2025](https://www.cloud-conf.net/datasec/2025/proceedings/pdfs/IDS2025-3SVVEmiJ6JbFRviTl4Otnv/966100a067/966100a067.pdf)

---

### Q6: State-of-the-Art / Non-Standard Indicator Principles

Beberapa approaches yang belum mainstream tapi menjanjikan:

1. **Copula-based indicators** — model dependence structure antara aset tanpa asumsi normalitas.捕捉 tail dependence (bear markets crash together lebih dari boom together). [MDPI JRFM](https://www.mdpi.com/1911-8074/18/9/506)
2. **Transfer Entropy** — measure directional information flow antara time series (bukan hanya correlation). Bisa detect lead-lag relationships. [arXiv 2511.16339](https://arxiv.org/html/2511.16339v1)
3. **Empirical Mode Decomposition** — adaptive, data-driven decomposition (tidak seperti Fourier/Wavelet yang pakai fixed basis). [Ehlers, MESA Software](https://www.mesasoftware.com/TechnicalArticles.htm)
4. **Laguerre Filters** — nonlinear time spacing between filter taps → short filters dengan smoothing characteristics of much longer filters. [Ehlers, MESA Software](https://www.mesasoftware.com/TechnicalArticles.htm)
5. **Fisher Transform** — convert any distribution ke approximately Gaussian → enables cleaner threshold-based signals. [Ehlers, MESA Software](https://www.mesasoftware.com/TechnicalArticles.htm)
6. **Directional Change** — alternative to time-based sampling, measures events (up/down overturns) instead of fixed time intervals. [Imperial College](https://www.imperial.ac.uk/media/imperial-college/faculty-of-natural-sciences/department-of-mathematics/math-finance/212236006---James-Mc-Greevy---MCGREEVY_JAMES_01075416.pdf)

---

### Q7: Framework untuk Skill Development

Berdasarkan seluruh research, berikut proposed framework untuk mengembangkan skill technical indicator:

**The Indicator Development Framework:**

```
Layer 1: INPUT PROCESSING
├── Denoising (Wavelet, Supersmoother, Kalman)
├── Normalization (Z-score, Min-Max, Rank)
└── Feature Extraction (OHLC → returns, log returns, ranges)

Layer 2: CORE PRINCIPLE SELECTION (pick 1-2 families)
├── Smoothing: SMA → EMA → DEMA → Adaptive variants
├── Filtering: Butterworth/Bessel → Low/High/Band-Pass
├── Regression: Linear → Polynomial → Regularized
├── Spectral: FFT → MESA → Hilbert → Wavelet
├── Fractal: Hurst → DFA → Multifractal
├── Volatility: ARCH → GARCH → EGARCH → GJR
├── Entropy: Shannon → Permutation → Approximate
├── Chaos: Lyapunov → Phase Space → Correlation Dimension
├── Bayesian: HMM → Particle Filter → Kalman
└── ML Hybrid: Autoencoder + LSTM + Clustering

Layer 3: SIGNAL GENERATION
├── Threshold-based (RSI > 70 = overbought)
├── Crossover-based (fast MA crosses slow MA)
├── Probability-based (HMM regime probability > 80%)
├── Divergence-based (price vs indicator divergence)
└── Composite scoring (combine multiple principles)

Layer 4: VALIDATION
├── Walk-forward optimization (not simple backtest)
├── Out-of-sample testing
├── Monte Carlo simulation
├── Regime-aware evaluation (test in bull/bear/chop separately)
└── Robustness checks (parameter sensitivity, data snooping)
```

**Design principles untuk skill:**

1. **Composable:** Setiap principle harus bisa di-stack dan di-combine
2. **Parameter-aware:** Document parameter sensitivity dan optimal ranges
3. **Regime-aware:** Indicator harus tahu "mode" market apa yang sedang berlangsung
4. **Adaptive:** Fixed parameters → underperform. Adaptive parameters → more robust
5. **Parsimonious:** Gunakan principle paling sederhana yang cukup untuk capture edge

---

## Comparison: DSP Filters vs Traditional Moving Averages

| Criterion | Traditional MA (SMA/EMA) | DSP Filters (Butterworth/Ehlers) | Adaptive MAs (KAMA/MAMA) |
|-----------|:------------------------:|:--------------------------------:|:------------------------:|
| Lag | High | Low-Medium | Low |
| Smoothness | Good | Excellent | Good |
| Noise rejection | Moderate | Excellent | Moderate-Excellent |
| Adaptivity | None | Fixed parameters | Self-adapting |
| Complexity | Very Low | High | Medium |
| Implementation | Trivial | Requires DSP knowledge | Moderate |
| Backtest reliability | Well-established | Mixed results | Good |

**Analysis:** DSP filters secara teori lebih optimal untuk isolasi frequency bands, tapi practically mereka menghadapi masalah yang sama dengan semua fixed-parameter approaches: non-stationarity. Adaptive MAs (KAMA, MAMA) offer the best of both worlds — low lag when needed, high smoothness when needed — by adjusting parameters based on market conditions. The practical recommendation: **use adaptive approaches as the default, reserve pure DSP for research/analysis**.

---

## Contradictions & Debates

### 1. DSP Cycle-Based Approaches — Theory vs Practice

Ehlers' BandPass filter approach shows strong theoretical foundation but **mixed independent backtest results**. Robot Wealth's experiments showed negative Sharpe for short-cycle BandPass (25-35 period) but positive results for wider bandwidths (30-70 period). [Robot Wealth](https://robotwealth.com/using-digital-signal-processing-in-quantitative-trading-strategies)

Ehlers himself acknowledges this: "backtesting does not work" — his indicators are better used as **measurement tools** (providing cycle period estimates, regime classification) rather than **standalone signal generators**. [Better System Trader](https://bettersystemtrader.com/backtesting-trading-strategies-does-not-work-john-ehlers)

**Resolution:** DSP filters are most valuable as **adaptive parameter providers** (e.g., measuring dominant cycle to set lookback periods) rather than direct signal generators. Use MESA to measure the cycle, then feed that measurement to a separate trading logic.

### 2. HMM vs Alternative Regime Detection

HMM is the most popular regime detection method in academia and industry. However, LSEG's independent study shows it suffers from **lagged identification** — by the time HMM switches to "bear" regime, the crash may already be 30-50% done. [LSEG](https://developers.lsg.com/en/article-catalog/article/market-regime-detection)

**Statistical Jump Models (JM)** outperform HMMs with:

- Lower turnover (44% vs 141%)
- Better Sharpe ratios across S&P 500, DAX, and Nikkei 225
- More persistent (intuitive) regimes [arXiv JM vs HMM](https://arxiv.org/html/2402.05272v2)

**Resolution:** HMM remains useful as a probabilistic framework, but for practical trading, consider JM or Adaptive Hierarchical HMM variants. Always combine with other signals — don't rely on regime detection alone.

---

## Uncertainties & Gaps

- ⚠️ **Framework taxonomy is my own synthesis** — no single authoritative paper proposes exactly this 10-family taxonomy. It's derived from converging evidence across DSP, financial engineering, and quantitative finance literature.
- ⚠️ **Transformer-based approaches** (2024-2025) are too new for comprehensive independent validation. Early results are promising but lack reproducibility.
- ⚠️ **Chaos theory in finance** remains controversial — evidence for deterministic chaos in markets is mixed. Some studies find positive Lyapunov exponents, others find results consistent with stochastic processes.
- ⚠️ **Most backtest results are in-sample or use limited out-of-sample** — true out-of-sample performance is generally worse than reported.

---

## Recommendations

### Primary Recommendation: Build the Skill with a Layered Architecture

Implement the 10-family taxonomy as composable modules. Each module should:

1. Accept standardized input (OHLCV + derived features)
2. Output both the indicator value AND its confidence/regime context
3. Document parameter sensitivity and optimal ranges
4. Include at least one adaptive variant per family

### Alternative: Focus on 3-4 Families First

For v1 of the skill, prioritize:

1. **Adaptive Smoothing** (KAMA, FRAMA, MAMA) — most practical, best understood
2. **Wavelet Denoising** — powerful preprocessing step
3. **HMM Regime Detection** — provides context for all other indicators
4. **Hurst/Entropy Composite** — regime classification (trending/random/mean-reverting)

### Not Recommended: Pure DSP or Pure Chaos Theory

Don't build indicators solely based on fixed-parameter DSP filters or chaos theory measures. They work in theory but are too fragile in practice due to non-stationarity. Use them as **components within adaptive frameworks**, not as standalone indicators.

---

## Methodology

- **Depth:** exhaustive
- **Search rounds:** 5 rounds, 26 total queries
- **Final confidence:** 88% (from research_checkpoint)
- **Sub-questions:** 10 defined, 10 answered
- **Multi-hop chains used:** Entity expansion (TradingView scripts → underlying mathematical principles → academic validation), Temporal progression (SMA → EMA → adaptive variants → MAMA), Conceptual deepening (filter design theory → practical implementation → limitations)
- **Key challenges:** Framework taxonomy is novel synthesis rather than citing a single authoritative source; Ehlers' work has limited independent validation; chaos theory evidence in finance is contested

---

## Sources

| # | Title | URL | Date | Credibility |
|---|-------|-----|------|:-----------:|
| 1 | Foundations of Technical Analysis (Lo, Mamaysky, Wang) | <https://web.mit.edu/Alo/www/Papers/techanal.html> | 2000 | ⭐ Tier 1 |
| 2 | Financial Signal Processing (Wikipedia) | <https://en.wikipedia.org/wiki/Financial_signal_processing> | 2024 | 🔵 Tier 2 |
| 3 | A Signal Processing Perspective on Financial Engineering (Feng & Palomar) | <https://palomar.home.ece.ust.hk/papers/2016/Feng&Palomar-FnT2016.pdf> | 2016 | ⭐ Tier 1 |
| 4 | Using DSP in Quantitative Trading (Robot Wealth) | <https://robotwealth.com/using-digital-signal-processing-in-quantitative-trading-strategies> | 2020 | 🔵 Tier 2 |
| 5 | Moving Average Comparison (MQL5) | <https://www.mql5.com/en/articles/3791> | 2024 | 🔵 Tier 2 |
| 6 | Types of Moving Averages (Zakamulin, Alpha Architect) | <https://alphaarchitect.com/trend-following-valeriy-zakamulin-types-moving-averages-part-2> | 2024 | 🔵 Tier 2 |
| 7 | Digital Filter Design (MathWorks) | <https://www.mathworks.com/help/signal/ug/practical-introduction-to-digital-filter-design.html> | 2024 | 🔵 Tier 2 |
| 8 | Digital Filtering (Analog Devices) | <https://www.analog.com/media/en/training-seminars/design-handbooks/mixedsignal_sect6.pdf> | 2024 | 🔵 Tier 2 |
| 9 | Polynomial MRB Trading System (Nguyen, MDPI Risks) | <https://www.mdpi.com/2227-9091/12/10/166> | 2024 | ⭐ Tier 1 |
| 10 | Penalized Logistic Regressions with Technical Indicators (Jiang et al., PMC) | <https://pmc.ncbi.nlm.nih.gov/articles/PMC9379894> | 2022 | ⭐ Tier 1 |
| 11 | Linear Regression for Traders (TrendSpider) | <https://trendspider.com/learning-center/a-comprehensive-guide-to-linear-regression-for-traders-and-investors> | 2024 | 🔵 Tier 2 |
| 12 | DSP for Trend Following (Alpha Architect) | <https://alphaarchitect.com/an-introduction-to-digital-signal-processing-for-trend-following> | 2024 | 🔵 Tier 2 |
| 13 | Wavelet Transforms in Financial Time Series (CMP Publisher) | <https://cmpublisher.com/wavelet-transforms-in-financial-time-series-analysis-a-review-on-stock-price-prediction> | 2024 | 🔵 Tier 2 |
| 14 | Wavelet Transform for Non-Stationary Time Series (MDPI Applied Sciences) | <https://www.mdpi.com/2076-3417/9/7/1345> | 2019 | ⭐ Tier 1 |
| 15 | Hurst Exponent and Trading Signals (Kroha & Skoula, SCITEPRESS) | <https://www.scitepress.org/papers/2018/66670/66670.pdf> | 2018 | ⭐ Tier 1 |
| 16 | Typical Algorithms for Estimating Hurst Exponent (arXiv) | <https://arxiv.org/html/2310.19051v3> | 2023 | ⭐ Tier 1 |
| 17 | Cryptocurrency Market: Fractal and Wavelet Analysis (CEUR-WS) | <https://ceur-ws.org/Vol-2713/paper40.pdf> | 2020 | 🔵 Tier 2 |
| 18 | GARCH Volatility Forecasting (QuantInsti) | <https://blog.quantinsti.com/garch-gjr-garch-volatility-forecasting-python> | 2024 | 🔵 Tier 2 |
| 19 | ARCH/GARCH Introduction (Engle, NYU Stern) | <https://www.stern.nyu.edu/rengle/GARCH101.PDF> | 2001 | ⭐ Tier 1 |
| 20 | Volatility Modeling: ARCH Family (Medium) | <https://medium.com/@simomenaldo/volatility-modeling-a-deep-dive-into-the-arch-family-f361bafbb3f7> | 2024 | 🟡 Tier 3 |
| 21 | Entropy Features for Trading (PapersWithBacktest) | <https://paperswithbacktest.com/course/entropy-features> | 2024 | 🔵 Tier 2 |
| 22 | Entropy Approach to Stock Market Efficiency (PMC) | <https://pmc.ncbi.nlm.nih.gov/articles/PMC9073522> | 2022 | ⭐ Tier 1 |
| 23 | Financial Information Theory (arXiv) | <https://arxiv.org/html/2511.16339v1> | 2025 | ⭐ Tier 1 |
| 24 | Shannon Entropy & Market Randomness (Robot Wealth) | <https://robotwealth.com/shannon-entropy> | 2024 | 🔵 Tier 2 |
| 25 | HMM Market Regimes (LuxAlgo) | <https://www.luxalgo.com/library/indicator/hidden-markov-model-market-regimes> | 2026 | 🔵 Tier 2 |
| 26 | HMM Enhanced Regime Probability (TradingView) | <https://www.tradingview.com/script/iF0ZwCVf-HMM-Enhanced-Regime-Probability> | 2025 | 🟡 Tier 3 |
| 27 | Hidden Markov Models for Stock Trading (MDPI Risks) | <https://www.mdpi.com/2227-7072/6/2/36> | 2018 | ⭐ Tier 1 |
| 28 | Particle Filters in HFT (DayTrading.com) | <https://www.daytrading.com/particle-filtering-hft> | 2026 | 🔵 Tier 2 |
| 29 | HMM & Particle Filters in Quant Trading (Medium) | <https://medium.com/@ibrahimlanre1890/kalman-and-particle-filters-in-quantitative-trading-e518e3db1d59> | 2024 | 🟡 Tier 3 |
| 30 | HMM Introduction (QuantStart) | <https://www.quantstart.com/articles/hidden-markov-models-an-introduction> | 2024 | 🔵 Tier 2 |
| 31 | LSTM Autoencoder + GAN Anomaly Detection (OpenAccess) | <https://www.opastpublishers.com/open-access-articles/robust-anomaly-detection-in-financial-markets-using-lstm-autoencoders-and-generative-adversarial-networks-9525.html> | 2024 | 🔵 Tier 2 |
| 32 | Hybrid LSTM-CNN for Stock Forecasting (MDPI JRFM) | <https://www.mdpi.com/1911-8074/18/4/201> | 2024 | ⭐ Tier 1 |
| 33 | Market Regime Detection with ML (QuestDB) | <https://questdb.com/glossary/market-regime-change-detection-with-ml> | 2024 | 🔵 Tier 2 |
| 34 | ML Market Regime Detection (QuantInsti) | <https://blog.quantinsti.com/epat-project-machine-learning-market-regime-detection-random-forest-python> | 2024 | 🔵 Tier 2 |
| 35 | GitHub: market-regime topic | <https://github.com/topics/market-regime> | 2026 | 🟡 Tier 3 |
| 36 | Hybrid AI Trading Strategy (Emergent Mind) | <https://www.emergentmind.com/topics/hybrid-ai-based-trading-strategy> | 2025 | 🔵 Tier 2 |
| 37 | Chaos Theory in Trading (MQL5) | <https://www.mql5.com/en/articles/15332> | 2024 | 🔵 Tier 2 |
| 38 | Chaos and Nonlinear Dynamics in Finance (Hsieh, Duke) | <https://people.duke.edu/~dah7/jf1991.pdf> | 1991 | ⭐ Tier 1 |
| 39 | Butterfly Effect in Economics (Herho, CODEE) | <https://scholarship.claremont.edu/codee/vol20/iss1/1> | 2026 | ⭐ Tier 1 |
| 40 | Lyapunov Exponents for Stock Crashes (CEUR-WS) | <https://ceur-ws.org/Vol-2732/20200455.pdf> | 2020 | 🔵 Tier 2 |
| 41 | Copula for Pairs Trading (MDPI JRFM) | <https://www.mdpi.com/1911-8074/18/9/506> | 2024 | ⭐ Tier 1 |
| 42 | Copula for Pairs Trading Intro (Hudson & Thames) | <https://hudsonthames.org/copula-for-pairs-trading-introduction> | 2024 | 🔵 Tier 2 |
| 43 | MAMA Adaptive Moving Averages (Ehlers 2001) | <http://traders.com/documentation/feedbk_docs/2001/09/Abstracts_new/Ehlers/ehlers.html> | 2001 | ⭐ Tier 1 |
| 44 | Ehlers Technical Papers (MESA Software) | <https://www.mesasoftware.com/TechnicalArticles.htm> | 2024 | 🔵 Tier 2 |
| 45 | Indicator Lag & DSP with Ehlers (Better System Trader) | <https://bettersystemtrader.com/048-john-ehlers> | 2020 | 🔵 Tier 2 |
| 46 | Backtesting Doesn't Work (Ehlers, BST) | <https://bettersystemtrader.com/backtesting-trading-strategies-does-not-work-john-ehlers> | 2024 | 🔵 Tier 2 |
| 47 | Market Regime Detection (LSEG) | <https://developers.lseg.com/en/article-catalog/article/market-regime-detection> | 2024 | 🔵 Tier 2 |
| 48 | Statistical Jump Models vs HMM (arXiv) | <https://arxiv.org/html/2402.05272v2> | 2024 | ⭐ Tier 1 |
| 49 | Adaptive Hierarchical HMM (MDPI JRFM) | <https://www.mdpi.com/1911-8074/19/1/15> | 2025 | ⭐ Tier 1 |
| 50 | HMM-Based Regime Detection with RL (Cloud-Conf) | <https://www.cloud-conf.net/datasec/2025/proceedings/pdfs/IDS2025-3SVVEmiJ6JbFRviTl4Otnv/966100a067/966100a067.pdf> | 2025 | 🔵 Tier 2 |
| 51 | Multivariate Regime Detection via Clustering (Imperial) | <https://www.imperial.ac.uk/media/imperial-college/faculty-of-natural-sciences/department-of-mathematics/math-finance/212236006---James-Mc-Greevy---MCGREEVY_JAMES_01075416.pdf> | 2022 | ⭐ Tier 1 |
| 52 | Time Series Complexity: Signal & ML Review (PMC) | <https://pmc.ncbi.nlm.nih.gov/articles/PMC8700684> | 2022 | ⭐ Tier 1 |
| 53 | Moving Averages: List by Purpose (AltcoinTrading) | <https://www.altcointrading.net/moving-averages-ema-wma-hull-triangular-alma-guide-pine-scripts> | 2024 | 🟡 Tier 3 |
| 54 | JC MAs Comparison (TradingView) | <https://www.tradingview.com/script/2rvQIEDe-JC-MAs-SMA-WMA-EMA-DEMA-TEMA-ALMA-Hull-Kaufman-Fractal> | 2025 | 🟡 Tier 3 |
| 55 | Entropy-Based Market Depth (PMC) | <https://pmc.ncbi.nlm.nih.gov/articles/PMC8147648> | 2021 | ⭐ Tier 1 |
| 56 | Intraday Entropy for Trading (Springer) | <https://link.springer.com/article/10.1007/s10614-026-11347-2> | 2026 | ⭐ Tier 1 |
| 57 | TEMA ChartSchool (StockCharts) | <https://chartsstockcharts.com/table-of-contents/technical-indicators-and-overlays/technical-overlays/triple-exponential-moving-average-tema> | 2024 | 🔵 Tier 2 |
| 58 | Adaptive MA (Thinkorswim) | <https://toslc.thinkorswim.com/center/reference/Tech-Indicators/studies-library/M-N/MovAvgAdaptive> | 2024 | 🔵 Tier 2 |
| 59 | Financial Markets Volatility Clustering (Cont et al.) | <http://rama.cont.perso.math.cnrs.fr/pdf/clustering.pdf> | 2001 | ⭐ Tier 1 |
| 60 | Regime-Aware Asset Allocation (QuantConnect) | <https://www.quantconnect.com/research/15298/pairs-trading-copula-vs-cointegration> | 2024 | 🟡 Tier 3 |
| 61 | Chaos Theory Application (Pariona, Dialnet) | <https://dialnet.unirioja.es/descarga/articulo/10524220.pdf> | 2025 | 🔵 Tier 2 |
| 62 | CNN-LSTM for Trading Decisions (IJACSA) | <https://thesai.org/Downloads/Volume15No6/Paper_85-From_Technical_Indicators_to_Trading_Decisions.pdf> | 2024 | 🔵 Tier 2 |
| 63 | Wavelet-based Disentangled Normalization (arXiv) | <https://arxiv.org/html/2506.05857v1> | 2025 | ⭐ Tier 1 |
| 64 | Strong Denoising of Financial Time Series (OpenReview) | <https://openreview.net/forum?id=GG80jy9KI5> | 2026 | 🔵 Tier 2 |
| 65 | TradingView Entropy Scripts | <https://my.tradingview.com/scripts/entropy> | 2026 | 🟡 Tier 3 |
