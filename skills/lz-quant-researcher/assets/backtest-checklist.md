# Backtest Validation Checklist

> Complete every item before allocating real capital. No exceptions. A "no" on any CRITICAL item is an automatic stop.

---

## Phase 1: Pre-Backtest Checks

| # | Check | Severity | Status |
|---|---|---|---|
| 1.1 | **Hypothesis documented** — written statement of *why* this should work, with economic rationale. Not "it looks good in the data." | 🔴 CRITICAL | ☐ |
| 1.2 | **Data quality audit** — source verified, NaN audit complete, corporate actions adjusted, timezone consistent | 🔴 CRITICAL | ☐ |
| 1.3 | **Survivorship bias addressed** — using survivorship-bias-free data OR explicitly documenting the bias | 🟡 HIGH | ☐ |
| 1.4 | **Point-in-time data confirmed** — not using revised/restated data for historical signals | 🔴 CRITICAL | ☐ |
| 1.5 | **Transaction cost model defined** — commission + spread + market impact, with documented assumptions | 🔴 CRITICAL | ☐ |
| 1.6 | **Out-of-sample period reserved** — last 20-30% of data not touched during development | 🟡 HIGH | ☐ |
| 1.7 | **Universe definition documented** — what instruments, what liquidity filters, what time period | 🟡 HIGH | ☐ |
| 1.8 | **Risk limits defined** — max position, max drawdown, max leverage, sector limits | 🟡 HIGH | ☐ |

---

## Phase 2: During-Backtest Checks

| # | Check | Severity | Status |
|---|---|---|---|
| 2.1 | **Walk-forward validation** — NOT single in-sample/out-of-sample split, but rolling folds with embargo | 🔴 CRITICAL | ☐ |
| 2.2 | **Embargo gap between train and test** — minimum 5 trading days to prevent information leakage | 🟡 HIGH | ☐ |
| 2.3 | **No look-ahead bias** — verified: no bfill(), no negative shift, no future data in features | 🔴 CRITICAL | ☐ |
| 2.4 | **Realistic execution assumptions** — trading at close? next open? with delay? documented | 🟡 HIGH | ☐ |
| 2.5 | **Parameter count ≤ 5** — each free parameter is an overfitting opportunity | 🟡 HIGH | ☐ |
| 2.6 | **Parameters have economic justification** — not magic numbers from optimization | 🟡 HIGH | ☐ |
| 2.7 | **Multiple time periods tested** — strategy must survive across at least 3 distinct regimes | 🟠 MEDIUM | ☐ |

---

## Phase 3: Post-Backtest Checks

| # | Check | Severity | Status |
|---|---|---|---|
| 3.1 | **Factor decomposition** — regressed against Fama-French (5F or 6F). Alpha t-stat > 2.0? | 🔴 CRITICAL | ☐ |
| 3.2 | **Sharpe haircut applied** — in-sample Sharpe × 0.5 = expected live Sharpe. Still viable? | 🔴 CRITICAL | ☐ |
| 3.3 | **Robustness test** — strategy survives ±20% parameter perturbation | 🟡 HIGH | ☐ |
| 3.4 | **Regime analysis** — performance split by bull/bear/sideways. Acceptable in all? | 🟡 HIGH | ☐ |
| 3.5 | **Drawdown analysis** — max drawdown, time to recovery, underwater percentage documented | 🟡 HIGH | ☐ |
| 3.6 | **Capacity analysis** — at target AUM, does market impact destroy alpha? | 🟠 MEDIUM | ☐ |
| 3.7 | **Gross vs net Sharpe comparison** — if net Sharpe < 50% of gross, strategy may be cost-limited | 🟡 HIGH | ☐ |
| 3.8 | **Stress testing** — tested against 2008 GFC, 2020 COVID, 2022 rate hikes at minimum | 🟡 HIGH | ☐ |
| 3.9 | **Multiple hypothesis correction** — if this is one of N strategies tested, Bonferroni applied? | 🟠 MEDIUM | ☐ |
| 3.10 | **Information Coefficient quality** — IC > 0.03, IR > 0.5, t-stat > 2.0? | 🟡 HIGH | ☐ |

---

## Phase 4: Go / No-Go for Paper Trading

Answer all five questions. **All must be "Yes" to proceed.**

| # | Question | Answer |
|---|---|---|
| 4.1 | Does the strategy have a clear, falsifiable economic hypothesis? | ☐ Yes / ☐ No |
| 4.2 | Is out-of-sample Sharpe > 1.0 after haircut and costs? | ☐ Yes / ☐ No |
| 4.3 | Does alpha survive factor decomposition (t-stat > 2.0)? | ☐ Yes / ☐ No |
| 4.4 | Has the strategy been tested across 3+ market regimes? | ☐ Yes / ☐ No |
| 4.5 | Is max drawdown tolerable at target position size? | ☐ Yes / ☐ No |

**Decision:** ☐ Proceed to Paper Trading / ☐ Reject / ☐ Needs More Research

---

## Phase 5: Paper Trading → Live Transition

| # | Check | Minimum Period | Status |
|---|---|---|---|
| 5.1 | **Paper trading duration** — 6 months minimum, 12 months preferred | 6 months | ☐ |
| 5.2 | **Paper vs backtest comparison** — paper Sharpe within 30% of backtest OOS Sharpe? | After 3 months | ☐ |
| 5.3 | **Execution quality** — fills within expected slippage? | Ongoing | ☐ |
| 5.4 | **Drawdown within expectations** — max paper DD ≤ 1.5× backtest max DD? | Ongoing | ☐ |
| 5.5 | **System reliability** — no missed signals, no data outages, no execution failures for 30+ consecutive days? | 1 month | ☐ |
| 5.6 | **Risk infrastructure live** — kill switch, position limits, drawdown stops all operational? | Before go-live | ☐ |
| 5.7 | **Monitoring dashboards** — PnL, risk, exposure, regime indicators all displaying correctly? | Before go-live | ☐ |

---

## Live Deployment Gates

| Gate | Criteria | Escalation |
|---|---|---|
| **Start small** | Deploy at 10-25% of target capital for first 3 months | Auto |
| **Scale up** | Increase to 50% if Sharpe on track after 3 months | PM approval |
| **Full allocation** | 100% only after 6+ months of consistent live performance | CIO approval |
| **Emergency stop** | If DD exceeds 1.5× max backtest DD, reduce to 25% immediately | Automatic |
| **Kill switch** | If DD exceeds 2× max backtest DD, flatten all positions | Automatic |

---

## Post-Deployment Monitoring

Run weekly:
- [ ] Compare live Sharpe to expected (backtest OOS × haircut)
- [ ] Check factor exposures haven't drifted
- [ ] Verify regime indicators — is the current regime favorable?
- [ ] Review turnover and cost drag vs. budget
- [ ] Check for capacity constraints (are fills getting worse?)
- [ ] Run `validate.py` on any code changes
