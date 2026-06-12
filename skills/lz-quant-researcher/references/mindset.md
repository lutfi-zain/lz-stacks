# The Quantitative Researcher's Philosophical Framework

> "All models are wrong, but some are useful." — George Box
> "Models are metaphors." — Emanuel Derman

---

## 1. Derman's Model Taxonomy

Emanuel Derman, head quant at Goldman Sachs for 17 years and author of *Models.Behaving.Badly*, created the most important classification system for understanding what financial models actually *are*.

### The Hierarchy

| Level | Name | Description | Financial Example | Reliability |
|---|---|---|---|---|
| 1 | **Theory** | Absolute truth discovered about nature | Newton's laws, Maxwell's equations | Near-certain |
| 2 | **Model** | A simplification that captures key relationships | Black-Scholes (assumes lognormal, constant vol) | Useful but limited |
| 3 | **Metaphor** | An analogy — it describes *what something is like*, not what it *is* | "The stock market is like a casino" | Dangerous if taken literally |

### The Critical Insight

**Financial "models" are almost always metaphors.** They borrow the language and mathematics of physics but describe human behavior, which is fundamentally different from particle behavior. Particles don't read research papers. Humans do.

When you build a momentum model, you are not discovering a law of nature. You are describing a *tendency* of human behavior that could change tomorrow if enough people read your paper and trade against it.

### Practical Implications

1. **Never trust a model's edge cases.** Black-Scholes works near the money, near expiration. It fails catastrophically at extremes (fat tails, jumps, liquidity crises).
2. **Always ask: "What is this model a metaphor for?"** If you can't articulate the human behavior the model captures, you don't understand your model.
3. **Model risk is not a footnote — it is the primary risk.** The model *is* the risk. The 2008 financial crisis was a model-risk crisis (Gaussian copulas for CDOs assumed correlation was stable).

---

## 2. The Financial Modelers' Hippocratic Oath

Written by Emanuel Derman and Paul Wilmott in 2009, in direct response to the global financial crisis. Every quantitative researcher should internalize this.

> **The Modelers' Hippocratic Oath**
>
> ~ I will remember that I didn't make the world, and it doesn't satisfy my equations.
>
> ~ Though I will use models boldly to estimate value, I will not be overly impressed by mathematics.
>
> ~ I will never sacrifice reality for elegance without explaining why I have done so.
>
> ~ Nor will I give the people who use my model false comfort about its accuracy. Instead, I will make explicit its assumptions and oversights.
>
> ~ I understand that my work may have enormous effects on society and the economy, many of them beyond my comprehension.

### Applying the Oath in Practice

| Oath Line | Practical Rule |
|---|---|
| "I didn't make the world" | Markets are not governed by your equations. Structural breaks happen. |
| "Not overly impressed by mathematics" | A complex model is not a better model. Occam's razor applies. |
| "Never sacrifice reality for elegance" | If the model says to sell and your gut says the data is wrong, investigate the data. |
| "Not give false comfort about accuracy" | Report confidence intervals, not point estimates. Show what the model *doesn't* know. |
| "Enormous effects beyond my comprehension" | Risk management is not optional. Position sizing is not optional. |

---

## 3. Dalio's Systematic Decision Framework

Ray Dalio's *Principles* framework, extracted from 40 years of running Bridgewater Associates — the world's largest hedge fund.

### Core Principles for Quant Research

**Radical Transparency:** Every decision, every signal, every trade must be documented and auditable. "If you can't explain it, you don't own it."

**Believability-Weighted Decision Making:** Not all opinions are equal. Weight by:
- Track record (has this researcher's signals worked before?)
- First-principles reasoning (does the logic make economic sense?)
- Stress-test results (has it survived hostile environments?)

**Systematize Everything:** If a decision is made more than once, it should be an algorithm:

```
1. Observe the data
2. Form a hypothesis (with economic rationale)
3. Test the hypothesis (with statistical rigor)
4. If it survives, systematize it
5. Monitor and adapt
```

**Risk Parity:** Don't concentrate risk. Balance risk across uncorrelated sources of return. A portfolio of 15 uncorrelated return streams, each with Sharpe 0.3, has a portfolio Sharpe > 1.0.

### The Pain + Reflection = Progress Loop

```
Mistake → Pain → Reflection → Principle → Improvement
```

Applied to quant research:
- **Mistake:** Strategy lost money in live trading
- **Pain:** Capital loss, reputation damage
- **Reflection:** Why? What assumption failed? What data changed?
- **Principle:** "Always test across regimes" / "Never use revised data"
- **Improvement:** Add regime detection, switch to point-in-time data

---

## 4. Kahneman's System 1 / System 2 Applied to Trading

Daniel Kahneman's dual-process theory from *Thinking, Fast and Slow* is directly applicable to understanding why humans are bad traders — and why systematic approaches work.

### System 1 (Fast, Intuitive, Emotional)

| Behavior | Trading Manifestation | Damage |
|---|---|---|
| Pattern recognition | Seeing patterns in random data | Overfitting |
| Loss aversion | Holding losers, cutting winners | Negative skew |
| Anchoring | "It was worth $100, so $80 is cheap" | Buying into declines |
| Availability bias | Recent events dominate decisions | Recency bias |
| Confirmation bias | Only seeing data that confirms hypothesis | Selection bias |
| Overconfidence | "This backtest is perfect" | Overleveraging |

### System 2 (Slow, Deliberate, Rational)

System 2 is what quantitative research *aspires* to be. But it's expensive (requires effort) and lazy (defaults to System 1 when tired).

**How to force System 2 in research:**

1. **Checklists** — Use the backtest checklist (`./assets/backtest-checklist.md`) every time. No exceptions.
2. **Pre-registration** — Write down your hypothesis and expected results *before* running the backtest.
3. **Devil's advocate** — For every positive result, spend 20 minutes trying to *disprove* it.
4. **Sleep on it** — Never go live on the same day you finished the backtest.
5. **Peer review** — Have someone who didn't build the strategy review it.

---

## 5. Taleb's Antifragility for Portfolio Construction

Nassim Nicholas Taleb's concept of *antifragility* — systems that gain from disorder — is the highest aspiration for a portfolio.

### The Fragile → Robust → Antifragile Spectrum

| Property | Fragile | Robust | Antifragile |
|---|---|---|---|
| **Reacts to volatility** | Breaks | Survives | Thrives |
| **Portfolio example** | Leveraged long-only equities | Diversified 60/40 | Barbell + tail hedges |
| **Strategy example** | Short volatility | Market-neutral stat-arb | Long convexity + carry |
| **Position sizing** | Fixed leverage | Risk parity | Convex payoff |
| **In a crash** | -50% or worse | -15% to -20% | -5% to +30% |

### Building Antifragile Portfolios

1. **Barbell Strategy:** 85% in extremely safe assets (T-bills, TIPS) + 15% in extremely risky bets (venture, deep OTM options, speculative ideas). The worst case is known (lose 15%), the best case is unbounded.

2. **Convex Payoffs:** Prefer strategies where the upside is larger than the downside. Options buying is convex. Options selling is concave. Trend-following is convex. Mean-reversion is concave.

3. **Optionality:** Keep optionality open. Don't commit 100% of capital to one strategy. Maintain dry powder. The best opportunities come during crises.

4. **Via Negativa:** Improve by removing fragilities, not by adding complexity. Remove the leverage. Remove the illiquid positions. Remove the single points of failure.

---

## 6. Sell-Side vs Buy-Side Mindset

Two fundamentally different approaches to quantitative finance. Understanding the distinction prevents applying the wrong tools to the wrong problems.

| Dimension | Sell-Side (Derivatives Pricing) | Buy-Side (Alpha Generation) |
|---|---|---|
| **Goal** | Price instruments correctly | Make money |
| **Core math** | Stochastic calculus, PDEs, measure theory | Statistics, ML, time-series analysis |
| **Key metric** | Pricing error, Greeks accuracy | Sharpe ratio, IC, drawdown |
| **Risk focus** | Hedging residual risk | Taking intelligent risk |
| **Time horizon** | Intraday to weeks | Days to years |
| **Canonical figures** | Black, Scholes, Merton, Derman | Simons, Dalio, Asness, Fama |
| **Tool of choice** | Monte Carlo simulation | Walk-forward backtest |
| **Failure mode** | Mispricing → arbitraged away | Overfitting → capital destruction |
| **Hiring profile** | Physics PhD, math PhD | CS PhD, stats PhD, domain expert |

### The Critical Difference

**Sell-side** models are used to *price* — they don't need to predict the future. Black-Scholes doesn't predict where the stock will go; it tells you the fair price of an option *given* assumptions.

**Buy-side** models are used to *predict* — and prediction in financial markets is fundamentally hard because:
1. Markets are reflexive (predictions change the thing being predicted)
2. Competition is fierce (if it worked, others would do it until it stopped working)
3. Regime changes make historical relationships unstable

This is why the buy-side requires **paranoia** that the sell-side doesn't. Your model isn't just wrong — it's wrong in ways that cost you money, and the market is actively trying to find and exploit your model's weaknesses.
