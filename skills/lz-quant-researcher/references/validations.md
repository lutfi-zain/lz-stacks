# Automated Validation Rules for Quantitative Research Code

> These rules are implemented in `./scripts/validate.py` and should be run on every research script before any capital allocation decision.

---

## Rule Summary Table

| ID | Name | Severity | Detection |
|---|---|---|---|
| QV-001 | Hardcoded Backtest Dates | 🔴 CRITICAL | Regex on date literals |
| QV-002 | Missing Transaction Costs | 🔴 CRITICAL | AST function scan |
| QV-003 | No Walk-Forward Split | 🔴 CRITICAL | AST/regex for train/test |
| QV-004 | No Out-of-Sample Holdout | 🟡 HIGH | Pattern matching |
| QV-005 | No Stationarity Check | 🟡 HIGH | Import/function scan |
| QV-006 | Look-Ahead Indicators | 🔴 CRITICAL | Regex for bfill/shift(-n) |
| QV-007 | Missing Risk Limits | 🟡 HIGH | Pattern scan |
| QV-008 | Single-Period Backtest | 🟠 MEDIUM | Date range analysis |
| QV-009 | No Regime Awareness | 🟠 MEDIUM | Keyword scan |
| QV-010 | Missing Null Checks | 🟡 HIGH | AST scan for dropna/fillna |

---

## QV-001: Hardcoded Backtest Dates

**Severity:** 🔴 CRITICAL
**File Glob:** `*.py`

**Why it matters:** Hardcoded dates like `"2020-01-01"` or `"2023-12-31"` in backtesting code often indicate cherry-picked time periods. The researcher may have (consciously or unconsciously) chosen dates that avoid drawdowns or include favorable regimes.

**Detection Pattern:**
```regex
(start_date|end_date|begin|backtest_start)\s*=\s*["']\d{4}-\d{2}-\d{2}["']
```

**Also flag:**
```regex
\.loc\[["']\d{4}.*?["']\s*:\s*["']\d{4}.*?["']\]
```

**Valid exceptions:**
- Configuration files explicitly labeled as config
- Date constants used for data download (not filtering results)
- Point-in-time reference dates with documented justification

**Fix:** Use relative date ranges (`end - timedelta(years=10)`) or parameterized configuration.

---

## QV-002: Missing Transaction Costs

**Severity:** 🔴 CRITICAL
**File Glob:** `*.py`

**Why it matters:** A backtest without transaction costs is not a backtest — it's a fantasy. Many "alpha" signals are entirely consumed by trading costs.

**Detection Pattern:**
Scan for backtesting functions that compute returns without any cost deduction. Flag if the file contains `backtest`, `pnl`, `returns`, or `strategy` in function names but does NOT contain any of:
```
transaction_cost, commission, spread, slippage, market_impact, trading_cost, bps, basis_point
```

**Fix:** Add explicit transaction cost modeling. Minimum: `commission_bps + spread_bps`. Better: include market impact model.

---

## QV-003: No Walk-Forward Split

**Severity:** 🔴 CRITICAL
**File Glob:** `*.py`

**Why it matters:** Without walk-forward validation, the entire dataset is used for both fitting and evaluation, guaranteeing overfitting.

**Detection Pattern:**
Flag if file contains backtesting logic but does NOT contain any of:
```
walk_forward, train_test_split, cross_val, rolling_window, expanding_window, out_of_sample, oos, holdout
```

**Fix:** Implement walk-forward validation. See `./references/patterns.md` for a production-ready implementation.

---

## QV-004: No Out-of-Sample Holdout

**Severity:** 🟡 HIGH
**File Glob:** `*.py`

**Why it matters:** Even with walk-forward validation, researchers often peek at the holdout data during development. A true out-of-sample period should be untouched until final validation.

**Detection Pattern:**
Flag if the file uses the entire date range for analysis without reserving a holdout:
```regex
# Flag patterns suggesting full-sample analysis
\.fit\(.*\).*\.predict\(.*\)  # without a separate test set
```

Look for absence of:
```
holdout, test_set, final_validation, unseen_data, reserved
```

**Fix:** Reserve the last 20-30% of data as a holdout that is NOT used during any development iteration.

---

## QV-005: No Stationarity Check

**Severity:** 🟡 HIGH
**File Glob:** `*.py`

**Why it matters:** Most statistical tests and models assume stationarity. Applying regression, correlation, or mean-reversion strategies to non-stationary data produces spurious results.

**Detection Pattern:**
Flag if the file works with price/return series but does NOT import or call:
```
adfuller, kpss, stationarity, unit_root, ADF, coint
```
from `statsmodels.tsa.stattools` or equivalent.

**Fix:** Run ADF test on all input series. If non-stationary, difference the series or use cointegration framework.

---

## QV-006: Look-Ahead Indicators

**Severity:** 🔴 CRITICAL
**File Glob:** `*.py`

**Why it matters:** Subtle forms of look-ahead bias that are easy to introduce accidentally.

**Detection Patterns:**
```regex
# Backward fill — uses future values to fill past NaNs
\.bfill\(\)
fillna\(.*method\s*=\s*["']bfill["']\)
fillna\(.*method\s*=\s*["']backfill["']\)

# Negative shift — accessing future rows
\.shift\(\s*-\d+\s*\)

# Full-sample statistics used for normalization
\.mean\(\).*\.std\(\)  # if applied before train/test split

# Future join without as-of merge
merge\(.*\)  # without explicit date-based as-of logic
```

**Fix:** Replace `bfill()` with `ffill()`. Replace `shift(-n)` with signal delay. Use expanding (not full-sample) statistics.

---

## QV-007: Missing Risk Limits

**Severity:** 🟡 HIGH
**File Glob:** `*.py`

**Why it matters:** A strategy without risk limits is a strategy waiting to blow up. Position limits, drawdown stops, and exposure caps are non-negotiable in production.

**Detection Pattern:**
Flag if the file contains trading/position logic but does NOT contain any of:
```
max_position, position_limit, stop_loss, max_drawdown, risk_limit, max_exposure, var_limit, leverage_limit
```

**Fix:** Implement at minimum: max position size, max portfolio drawdown stop, max gross leverage.

---

## QV-008: Single-Period Backtest

**Severity:** 🟠 MEDIUM
**File Glob:** `*.py`

**Why it matters:** A strategy tested on only one time period (e.g., 2015-2020) provides no evidence of robustness. It may work only in that specific regime.

**Detection Pattern:**
Parse date ranges in the code. Flag if:
- Total backtest period < 5 years
- Backtest covers only one market regime (e.g., only post-2009 bull market)
- No mention of multiple periods or regime testing

**Fix:** Test across at least 3 distinct market regimes (e.g., 2000-2003 dot-com crash, 2007-2009 GFC, 2020 COVID, 2022 rate hikes). Minimum 10 years of data preferred.

---

## QV-009: No Regime Awareness

**Severity:** 🟠 MEDIUM
**File Glob:** `*.py`

**Why it matters:** Strategies that ignore market regimes will inevitably fail during regime transitions. A momentum strategy in a mean-reverting market is a losing strategy.

**Detection Pattern:**
Flag if strategy code does NOT contain any of:
```
regime, hmm, hidden_markov, volatility_regime, bull, bear, market_state, regime_detect, market_regime
```

**Fix:** Implement regime detection and adapt strategy behavior per regime. See `./references/patterns.md` for HMM implementation.

---

## QV-010: Missing Null Checks

**Severity:** 🟡 HIGH
**File Glob:** `*.py`

**Why it matters:** NaN values in financial data propagate silently through calculations, producing incorrect signals, inflated returns, and ghost trades.

**Detection Pattern:**
Flag if the file reads data (`read_csv`, `read_parquet`, `DataFrame`, `api`) but does NOT contain any of:
```
dropna, fillna, isna, isnull, notna, notnull, assert.*null, assert.*nan
```

**Fix:** Add explicit null handling after every data load and before every computation:
```python
assert df.isnull().sum().sum() == 0, f"Found {df.isnull().sum().sum()} NaN values"
# or
df = df.dropna(subset=critical_columns)
```
