# Sharp Edges — 10 Critical Failure Modes in Quantitative Research

> Every failure mode below has destroyed real capital. Learn from others' losses.

---

## 1. Look-Ahead Bias

| | |
|---|---|
| **Severity** | 🔴 CRITICAL |
| **Frequency** | Extremely common in academic and retail research |
| **Capital destroyed** | Unbounded — entire strategy is invalid |

**Description:** Using information that would not have been available at the time of the trading decision. The most insidious form of overfitting because the backtest looks *perfect* — and the researcher genuinely believes it works.

**Detection Patterns:**
- Point-in-time data not used (using revised GDP/earnings instead of initial release)
- Filling NaN forward from future values (`fillna(method='bfill')` on time-series)
- Using close price for signals that trigger intraday
- Index composition as of today applied historically (survivorship + look-ahead)
- Feature engineering using full-sample statistics (mean, std computed over entire dataset)

**Solution:**
- Use point-in-time databases (Compustat PIT, Bloomberg BPIPE)
- Timestamp every data point; never use data before its release date
- Implement strict `as_of(date)` data access — no exceptions
- Walk-forward validation makes look-ahead structurally impossible

**Real-World Example:** A fund built a "revolutionary" earnings surprise model with Sharpe 4.0+. It was using Compustat restated earnings — numbers that changed months after the original filing. With point-in-time data, Sharpe dropped to 0.3.

---

## 2. Overfitting (The Haircut Rule)

| | |
|---|---|
| **Severity** | 🔴 CRITICAL |
| **Frequency** | Universal — every researcher does this |
| **Capital destroyed** | Proportional to overconfidence |

**Description:** Adding parameters, filters, and conditions until the backtest looks good. Each degree of freedom added is a chance to fit noise. The "haircut rule": expect live Sharpe to be 30-50% of backtest Sharpe.

**Detection Patterns:**
- More than 5 free parameters for a single strategy
- Strategy only works with specific parameter values (no plateau)
- Parameter values that are "magic numbers" without economic justification
- Sharpe > 3.0 on daily data (almost certainly overfit)
- Adding filters that coincidentally avoid known crash dates

**Solution:**
- Apply the **haircut**: In-sample Sharpe 3.0 → expect 1.0-1.5 live
- Robustness test: strategy must work across ±20% parameter perturbation
- Economic justification for every parameter
- Use Bayesian Information Criterion (BIC) to penalize complexity
- Out-of-sample performance is the *only* truth

**Real-World Example:** A Sharpe-5.0 mean-reversion strategy with 12 parameters. Each parameter was optimized on historical data. Live performance: Sharpe 0.4 for 6 months, then -0.8 during a regime shift. The 12 parameters had memorized the past.

---

## 3. Survivorship Bias

| | |
|---|---|
| **Severity** | 🔴 CRITICAL |
| **Frequency** | Common in equity and fund analysis |
| **Capital destroyed** | Systematic — inflates all returns |

**Description:** Only analyzing securities that still exist today. Delisted, bankrupt, and acquired companies are excluded, inflating historical returns by 1-3% annually.

**Detection Patterns:**
- Using current index constituents for historical analysis
- Stock universe doesn't include delisted companies
- Fund database doesn't include dead funds
- Crypto analysis excluding coins that went to zero

**Solution:**
- Use survivorship-bias-free databases (CRSP, point-in-time indices)
- Explicitly include delisted/bankrupt securities with terminal returns
- For indices, use historical constituent lists (not current)
- Adjust for delisting returns (typically -30% to -100%)

**Real-World Example:** The "stocks beat bonds by 7% annually" narrative uses US-only data — the most successful stock market in history. Including markets that were shut down (Russia 1917, China 1949, many others), the premium drops to ~3-4%.

---

## 4. Capacity Limits

| | |
|---|---|
| **Severity** | 🟡 HIGH |
| **Frequency** | Common in high-frequency and small-cap strategies |
| **Capital destroyed** | Gradual — alpha decays as AUM grows |

**Description:** A strategy that works at $1M may not work at $100M. Market impact, liquidity constraints, and crowding effects create capacity ceilings that most backtests ignore.

**Detection Patterns:**
- Average daily volume (ADV) of traded instruments not checked
- Position size > 5% of ADV
- No market impact model in backtest
- Strategy relies on small-cap or illiquid instruments
- No capacity analysis in research report

**Solution:**
- Model market impact: cost ∝ √(participation_rate)
- Limit position to < 2% of ADV for liquid stocks, < 0.5% for illiquid
- Estimate strategy capacity: max AUM where Sharpe stays > target
- Test at 2x and 5x target AUM with impact costs

**Real-World Example:** A stat-arb strategy returning 40% annually at $10M. At $200M, market impact consumed 80% of alpha. At $500M, the strategy was net-negative. The fund returned capital.

---

## 5. Data Quality (Missing & Incorrect Data)

| | |
|---|---|
| **Severity** | 🟡 HIGH |
| **Frequency** | Pervasive |
| **Capital destroyed** | Variable — often hidden |

**Description:** Bad data is the silent killer. Missing values, corporate action adjustments, timezone errors, and vendor errors can create phantom signals.

**Detection Patterns:**
- No null/NaN audit before signal computation
- Prices not adjusted for splits and dividends
- Timezone mismatches between data sources
- Sudden spikes/drops not validated (could be bad ticks or real events)
- Vendor data accepted without cross-referencing

**Solution:**
- Implement data quality pipeline: completeness, range checks, spike detection
- Cross-reference minimum 2 data vendors for critical data
- Use adjusted prices consistently (or raw + explicit adjustment)
- Log and investigate every data anomaly before trading on it
- Build "data is guilty until proven innocent" culture

**Real-World Example:** A European equity strategy showed strong alpha. Investigation revealed the data vendor had inconsistent timezone handling — London and Frankfurt close prices were mixed, creating artificial overnight gaps that the strategy was trading.

---

## 6. Regime Blindness

| | |
|---|---|
| **Severity** | 🟡 HIGH |
| **Frequency** | Common in strategies trained on single-regime data |
| **Capital destroyed** | Catastrophic during regime shifts |

**Description:** Training a strategy in one market regime (e.g., low volatility bull market) and deploying it without awareness that regimes change. Momentum strategies fail in range-bound markets. Mean-reversion fails in trending markets.

**Detection Patterns:**
- No regime detection or classification in the strategy
- Backtest only covers 2010-2020 (a single bull market regime)
- No stress testing against historical crises
- Strategy has no mechanism to reduce exposure during regime shifts
- Constant position sizing regardless of volatility

**Solution:**
- Implement regime detection (HMM, volatility regime, trend indicators)
- Backtest across multiple regimes (include 2000, 2008, 2020, 2022)
- Adapt position sizing to regime (e.g., half-Kelly in uncertain regimes)
- Build strategy ensemble: different strategies for different regimes
- Monitor regime indicators in real-time

**Real-World Example:** A momentum fund built during 2012-2019 (steady uptrend). Q1 2020: momentum crashed, reversed, then whipsawed. The fund lost 40% in 6 weeks because it had no mechanism to detect or adapt to the regime change.

---

## 7. Transaction Cost Blindness

| | |
|---|---|
| **Severity** | 🟡 HIGH |
| **Frequency** | Very common in academic research |
| **Capital destroyed** | 100% of apparent alpha in many cases |

**Description:** Backtesting without realistic transaction costs (commissions, spreads, market impact, slippage). Many strategies that show positive gross returns are net-negative after costs.

**Detection Patterns:**
- No transaction cost model in backtest code
- Costs modeled as flat fee only (ignoring spread and impact)
- Daily turnover > 50% without cost analysis
- No comparison of gross vs. net Sharpe ratio
- Using mid-price for execution (real execution is at bid/ask)

**Solution:**
- Model three cost components: commission + spread + market impact
- Market impact: use square-root model — cost ∝ σ × √(V/ADV)
- Compare gross Sharpe vs. net Sharpe — if decay > 50%, the strategy may be unviable
- Prefer low-turnover strategies (weekly/monthly rebalance)
- Include slippage buffer: add 2-5 bps to estimated costs

**Real-World Example:** An academic paper claimed 15% annual alpha from a daily-rebalanced factor strategy. After adding realistic costs (5 bps commission + 10 bps spread + 15 bps impact for the illiquid names), alpha was -3% annually.

---

## 8. Factor Exposure Disguised as Alpha

| | |
|---|---|
| **Severity** | 🟠 MEDIUM |
| **Frequency** | Extremely common |
| **Capital destroyed** | Opportunity cost — paying hedge fund fees for beta |

**Description:** A strategy that appears to generate alpha but is actually just loading on known risk factors (value, momentum, size, quality, low-vol). You're paying 2-and-20 for something a $10B index fund does for 3 bps.

**Detection Patterns:**
- No factor decomposition performed
- Strategy correlated > 0.5 with any Fama-French factor
- R² > 0.7 when regressed on factor returns
- Alpha t-stat < 2.0 after factor adjustment
- Strategy narrative sounds like a known factor ("buy cheap stocks")

**Solution:**
- Run Fama-French 5-factor (or 6-factor with momentum) regression
- Alpha must be significant (t-stat > 2.0) *after* factor adjustment
- Report factor-adjusted Sharpe, not raw Sharpe
- Be honest: if your strategy is "value + quality", call it that
- True alpha is rare — ~5% of strategies have it after factor adjustment

**Real-World Example:** A "proprietary AI stock picker" with 12% annual returns. Factor decomposition: 5% market beta, 3% value, 2% momentum, 2% quality, 0% alpha. The AI had learned to buy cheap, high-quality, trending stocks — something Vanguard does for 3 bps.

---

## 9. Backtest Snooping (Multiple Hypothesis Testing)

| | |
|---|---|
| **Severity** | 🟠 MEDIUM |
| **Frequency** | Pervasive in research teams |
| **Capital destroyed** | Team-level — erodes research credibility |

**Description:** Testing 100 strategies and reporting the best one without adjusting for the multiple comparisons. With 100 strategies, you *expect* ~5 to show p < 0.05 by chance alone.

**Detection Patterns:**
- No record of how many strategies were tested before finding "the one"
- No Bonferroni or Benjamini-Hochberg correction
- Research log doesn't exist or is incomplete
- Sharpe ratio presented without deflation for multiple testing
- "We tested a few variations" (how many is "a few"?)

**Solution:**
- Maintain a complete research log of all tested hypotheses
- Apply Harvey, Liu, Zhu (2016) deflated Sharpe ratio
- Bonferroni correction: α_adjusted = 0.05 / n_tests
- Use holdout data that has *never been touched* by any strategy
- Pre-register hypotheses before testing (scientific method)

**Real-World Example:** Harvey, Liu, and Zhu (2016) showed that most "anomalies" in finance literature fail to survive correction for multiple testing. Of ~300 published factors, fewer than 30 survive at the 5% level after adjusting for the number of factors tested.

---

## 10. Selection Bias in Strategy Reporting

| | |
|---|---|
| **Severity** | 🟠 MEDIUM |
| **Frequency** | Universal in fund marketing |
| **Capital destroyed** | Investor capital allocated based on misleading track records |

**Description:** Only reporting the best-performing variant, time period, or asset class. The "Texas sharpshooter fallacy" applied to finance: shoot first, draw the target around the bullet holes.

**Detection Patterns:**
- Backtest starts on a date that happens to avoid a known drawdown
- Only one asset class or region shown (why not others?)
- Cherry-picked time period (e.g., 2009-2019 for equity strategies)
- No worst-case period analysis
- Survivorship in strategy variants — how many died?

**Solution:**
- Report performance across ALL time periods (including unfavorable ones)
- Show all asset classes / regions tested, not just the best
- Include worst drawdown, longest recovery, and worst year
- Report what percentage of strategy variants were profitable
- Use full-sample analysis as the primary result

**Real-World Example:** A fund marketed a strategy with a "10-year track record" starting in March 2009 — the exact bottom of the GFC. Starting 12 months earlier, the strategy showed -45% drawdown. The marketing omitted this.
