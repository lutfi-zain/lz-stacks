# Production Code Patterns for Quantitative Research

> These are **battle-tested** patterns extracted from production quant systems. Each function is self-contained, documented, and runnable with standard Python scientific stack (`numpy`, `pandas`, `scipy`, `statsmodels`, `sklearn`).

---

## 1. Walk-Forward Validation Engine

The **only** acceptable backtesting methodology. In-sample/out-of-sample splits that roll forward through time, eliminating look-ahead bias by construction.

```python
"""Walk-forward validation engine for time-series strategy backtesting."""
import pandas as pd
import numpy as np
from dataclasses import dataclass
from typing import Callable, List


@dataclass
class WalkForwardResult:
    """Single fold result from walk-forward validation."""
    fold: int
    train_start: pd.Timestamp
    train_end: pd.Timestamp
    test_start: pd.Timestamp
    test_end: pd.Timestamp
    in_sample_sharpe: float
    out_of_sample_sharpe: float
    out_of_sample_returns: pd.Series


def walk_forward_validate(
    data: pd.DataFrame,
    strategy_fn: Callable[[pd.DataFrame], pd.Series],
    n_folds: int = 5,
    train_ratio: float = 0.6,
    embargo_days: int = 5,
    min_train_days: int = 252,
) -> List[WalkForwardResult]:
    """
    Execute walk-forward validation with embargo gap.

    Parameters
    ----------
    data : pd.DataFrame
        Price data with DatetimeIndex. Must contain 'close' column.
    strategy_fn : Callable
        Function that takes training data and returns signal series
        for the full dataset. Must NOT peek at test data.
    n_folds : int
        Number of walk-forward folds.
    train_ratio : float
        Fraction of each fold used for training.
    embargo_days : int
        Gap between train and test to prevent information leakage.
    min_train_days : int
        Minimum training window in calendar days.

    Returns
    -------
    List[WalkForwardResult]
        Results for each fold, including OOS Sharpe ratios.

    Raises
    ------
    ValueError
        If data is too short for the requested configuration.
    """
    results = []
    total_days = len(data)
    fold_size = total_days // n_folds

    if fold_size < min_train_days + embargo_days + 20:
        raise ValueError(
            f"Insufficient data: {total_days} rows for {n_folds} folds. "
            f"Need at least {(min_train_days + embargo_days + 20) * n_folds} rows."
        )

    for fold in range(n_folds):
        fold_start = fold * fold_size
        fold_end = min((fold + 1) * fold_size, total_days)

        train_end_idx = fold_start + int((fold_end - fold_start) * train_ratio)
        test_start_idx = train_end_idx + embargo_days

        if test_start_idx >= fold_end:
            continue

        train_data = data.iloc[fold_start:train_end_idx]
        test_data = data.iloc[test_start_idx:fold_end]

        # Strategy generates signals using ONLY training data
        signals = strategy_fn(train_data)

        # Apply signals to test period
        test_returns = test_data["close"].pct_change() * signals.reindex(
            test_data.index, method="ffill"
        ).fillna(0)
        train_returns = train_data["close"].pct_change() * signals.reindex(
            train_data.index, method="ffill"
        ).fillna(0)

        is_sharpe = _annualized_sharpe(train_returns.dropna())
        oos_sharpe = _annualized_sharpe(test_returns.dropna())

        results.append(WalkForwardResult(
            fold=fold,
            train_start=train_data.index[0],
            train_end=train_data.index[-1],
            test_start=test_data.index[0],
            test_end=test_data.index[-1],
            in_sample_sharpe=is_sharpe,
            out_of_sample_sharpe=oos_sharpe,
            out_of_sample_returns=test_returns,
        ))

    return results


def _annualized_sharpe(returns: pd.Series, periods: int = 252) -> float:
    """Calculate annualized Sharpe ratio assuming zero risk-free rate."""
    if returns.std() == 0 or len(returns) < 2:
        return 0.0
    return float(returns.mean() / returns.std() * np.sqrt(periods))
```

**Usage:**
```python
results = walk_forward_validate(price_data, my_momentum_strategy, n_folds=5)
for r in results:
    decay = 1 - (r.out_of_sample_sharpe / r.in_sample_sharpe) if r.in_sample_sharpe else 0
    print(f"Fold {r.fold}: IS={r.in_sample_sharpe:.2f} OOS={r.out_of_sample_sharpe:.2f} Decay={decay:.0%}")
```

---

## 2. Information Coefficient (IC) Calculation

The **Rank IC** (Spearman correlation between predicted and realized returns) is the fundamental measure of signal quality.

```python
"""Rolling Information Coefficient (IC) with statistical testing."""
import pandas as pd
import numpy as np
from scipy import stats


def calculate_rolling_ic(
    signal: pd.Series,
    forward_returns: pd.Series,
    window: int = 63,
    method: str = "spearman",
) -> pd.DataFrame:
    """
    Calculate rolling Information Coefficient between signal and forward returns.

    Parameters
    ----------
    signal : pd.Series
        Cross-sectional or time-series signal values.
    forward_returns : pd.Series
        Realized forward returns aligned with signal dates.
    window : int
        Rolling window size (default: 63 = 1 quarter).
    method : str
        'spearman' (rank IC, preferred) or 'pearson'.

    Returns
    -------
    pd.DataFrame
        Columns: ic, cumulative_ic, t_stat, p_value, ir
    """
    aligned = pd.DataFrame({"signal": signal, "fwd_ret": forward_returns}).dropna()

    rolling_ic = aligned["signal"].rolling(window).corr(
        aligned["fwd_ret"],
    )

    if method == "spearman":
        # Override with rank correlation
        rolling_ic = (
            aligned["signal"].rolling(window)
            .apply(lambda x: stats.spearmanr(
                x, aligned["fwd_ret"].loc[x.index]
            )[0], raw=False)
        )

    cumulative_ic = rolling_ic.expanding().mean()

    # IC Information Ratio = mean(IC) / std(IC)
    ic_mean = rolling_ic.expanding().mean()
    ic_std = rolling_ic.expanding().std()
    ir = ic_mean / ic_std.replace(0, np.nan)

    # T-statistic for IC significance
    n = rolling_ic.expanding().count()
    t_stat = ic_mean * np.sqrt(n)

    return pd.DataFrame({
        "ic": rolling_ic,
        "cumulative_ic": cumulative_ic,
        "t_stat": t_stat,
        "ir": ir,
    })


def evaluate_signal_quality(ic_series: pd.Series) -> dict:
    """
    Evaluate signal quality from IC time series.

    Thresholds (Grinold & Kahn):
    - IC > 0.03: Minimal signal
    - IC > 0.05: Good signal
    - IC > 0.10: Excellent signal (suspicious — check for bias)
    - IR > 0.5:  Investable
    - IR > 1.0:  Exceptional
    - t-stat > 2.0: Statistically significant
    """
    ic_mean = ic_series.dropna().mean()
    ic_std = ic_series.dropna().std()
    ir = ic_mean / ic_std if ic_std > 0 else 0.0
    n = ic_series.dropna().count()
    t_stat = ic_mean * np.sqrt(n)

    return {
        "mean_ic": round(ic_mean, 4),
        "ic_std": round(ic_std, 4),
        "ir": round(ir, 4),
        "t_stat": round(t_stat, 2),
        "n_observations": int(n),
        "hit_rate": round((ic_series.dropna() > 0).mean(), 3),
        "quality": (
            "SUSPICIOUS" if ic_mean > 0.10 else
            "EXCELLENT" if ic_mean > 0.05 else
            "GOOD" if ic_mean > 0.03 else
            "WEAK"
        ),
        "significant": t_stat > 2.0,
    }
```

---

## 3. Statistical Arbitrage — Cointegration Testing

```python
"""Cointegration testing for pairs/basket trading strategies."""
import numpy as np
import pandas as pd
from statsmodels.tsa.stattools import coint, adfuller
from statsmodels.regression.linear_model import OLS
from statsmodels.tools import add_constant


def test_cointegration_pair(
    price_a: pd.Series,
    price_b: pd.Series,
    significance: float = 0.05,
) -> dict:
    """
    Test cointegration between two price series (Engle-Granger method).

    Returns hedge ratio, spread statistics, and half-life of mean reversion.
    """
    # Step 1: Engle-Granger cointegration test
    score, pvalue, _ = coint(price_a, price_b)

    # Step 2: OLS hedge ratio
    X = add_constant(price_b.values)
    model = OLS(price_a.values, X).fit()
    hedge_ratio = model.params[1]
    intercept = model.params[0]

    # Step 3: Compute spread
    spread = price_a - hedge_ratio * price_b - intercept

    # Step 4: ADF test on spread (should be stationary)
    adf_stat, adf_pvalue, _, _, adf_critical, _ = adfuller(spread.dropna())

    # Step 5: Half-life of mean reversion (Ornstein-Uhlenbeck)
    spread_lag = spread.shift(1).dropna()
    spread_diff = spread.diff().dropna()
    aligned = pd.DataFrame({"lag": spread_lag, "diff": spread_diff}).dropna()
    hl_model = OLS(aligned["diff"], add_constant(aligned["lag"])).fit()
    theta = hl_model.params.iloc[1] if hasattr(hl_model.params, 'iloc') else hl_model.params[1]
    half_life = -np.log(2) / theta if theta < 0 else float("inf")

    return {
        "cointegrated": pvalue < significance,
        "eg_pvalue": round(pvalue, 4),
        "eg_score": round(score, 4),
        "hedge_ratio": round(hedge_ratio, 4),
        "spread_mean": round(spread.mean(), 4),
        "spread_std": round(spread.std(), 4),
        "adf_statistic": round(adf_stat, 4),
        "adf_pvalue": round(adf_pvalue, 4),
        "adf_stationary": adf_pvalue < significance,
        "half_life_days": round(half_life, 1),
        "tradeable": (
            pvalue < significance
            and adf_pvalue < significance
            and 5 < half_life < 120
        ),
    }
```

---

## 4. Factor Analysis — Fama-French Decomposition

```python
"""Factor exposure analysis using Fama-French 5-factor model."""
import pandas as pd
import numpy as np
from statsmodels.regression.linear_model import OLS
from statsmodels.tools import add_constant


def decompose_returns(
    strategy_returns: pd.Series,
    factor_returns: pd.DataFrame,
    annualize: int = 252,
) -> dict:
    """
    Decompose strategy returns into factor exposures + alpha.

    Parameters
    ----------
    strategy_returns : pd.Series
        Daily excess returns (strategy return - risk-free rate).
    factor_returns : pd.DataFrame
        Columns: Mkt-RF, SMB, HML, RMW, CMA (Fama-French 5 factors).
        Download from: https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html

    Returns
    -------
    dict
        Factor exposures (betas), alpha, R-squared, and significance tests.

    WARNING: ~95% of strategies that "beat the market" are simply loading on
    known factors (value, momentum, size). True alpha is rare.
    """
    aligned = pd.DataFrame({
        "strategy": strategy_returns
    }).join(factor_returns, how="inner").dropna()

    y = aligned["strategy"]
    X = add_constant(aligned[factor_returns.columns])

    model = OLS(y, X).fit()

    # Annualized alpha
    daily_alpha = model.params["const"]
    annual_alpha = daily_alpha * annualize
    alpha_tstat = model.tvalues["const"]

    # Factor exposures
    exposures = {}
    for factor in factor_returns.columns:
        exposures[factor] = {
            "beta": round(model.params[factor], 4),
            "t_stat": round(model.tvalues[factor], 2),
            "significant": abs(model.tvalues[factor]) > 2.0,
        }

    # How much variance is explained by factors?
    r_squared = model.rsquared

    return {
        "annual_alpha_pct": round(annual_alpha * 100, 2),
        "alpha_t_stat": round(alpha_tstat, 2),
        "alpha_significant": abs(alpha_tstat) > 2.0,
        "r_squared": round(r_squared, 4),
        "unexplained_variance": round(1 - r_squared, 4),
        "factor_exposures": exposures,
        "verdict": (
            "TRUE_ALPHA" if abs(alpha_tstat) > 2.0 and r_squared < 0.5
            else "FACTOR_TILT" if r_squared > 0.7
            else "MIXED" if abs(alpha_tstat) > 2.0
            else "NO_ALPHA"
        ),
    }
```

---

## 5. Regime Detection — Hidden Markov Model

```python
"""Market regime detection using Gaussian Hidden Markov Models."""
import numpy as np
import pandas as pd
from sklearn.mixture import GaussianMixture


def detect_regimes(
    returns: pd.Series,
    n_regimes: int = 3,
    lookback: int = 252,
) -> pd.DataFrame:
    """
    Detect market regimes (e.g., bull/bear/sideways) using Gaussian Mixture.

    Uses sklearn GaussianMixture as a lightweight HMM proxy.
    For production, consider hmmlearn.GaussianHMM for proper transition matrix.

    Parameters
    ----------
    returns : pd.Series
        Daily returns with DatetimeIndex.
    n_regimes : int
        Number of regimes to detect (typically 2 or 3).
    lookback : int
        Window for computing features (volatility, momentum).

    Returns
    -------
    pd.DataFrame
        Columns: return, volatility, momentum, regime, regime_label
    """
    features = pd.DataFrame(index=returns.index)
    features["return"] = returns
    features["volatility"] = returns.rolling(lookback // 4).std() * np.sqrt(252)
    features["momentum"] = returns.rolling(lookback // 2).mean() * 252
    features = features.dropna()

    X = features[["volatility", "momentum"]].values

    gmm = GaussianMixture(
        n_components=n_regimes,
        covariance_type="full",
        n_init=10,
        random_state=42,
    )
    features["regime"] = gmm.fit_predict(X)

    # Label regimes by mean return
    regime_stats = features.groupby("regime")["return"].agg(["mean", "std"])
    regime_stats = regime_stats.sort_values("mean")
    label_map = {}
    labels = ["BEAR", "SIDEWAYS", "BULL"][:n_regimes]
    for i, (regime_id, _) in enumerate(regime_stats.iterrows()):
        label_map[regime_id] = labels[i]

    features["regime_label"] = features["regime"].map(label_map)

    return features


def regime_aware_strategy_selection(regime_label: str) -> dict:
    """
    Map regime to preferred strategy types.

    Based on empirical evidence from 20+ years of systematic trading:
    - BULL: Momentum thrives, mean-reversion suffers
    - BEAR: Defensive (carry, quality), short momentum fails
    - SIDEWAYS: Mean-reversion thrives, momentum whipsaws
    """
    strategy_map = {
        "BULL": {
            "preferred": ["trend_following", "momentum", "risk_on_carry"],
            "avoid": ["mean_reversion", "short_vol"],
            "position_sizing": "full",
        },
        "BEAR": {
            "preferred": ["defensive_carry", "quality", "tail_hedging"],
            "avoid": ["momentum", "small_cap", "high_beta"],
            "position_sizing": "half",
        },
        "SIDEWAYS": {
            "preferred": ["mean_reversion", "pairs_trading", "vol_selling"],
            "avoid": ["trend_following", "breakout"],
            "position_sizing": "three_quarter",
        },
    }
    return strategy_map.get(regime_label, strategy_map["SIDEWAYS"])
```

---

## 6. Transaction Cost Modeling

```python
"""Realistic transaction cost model for strategy backtesting."""
import numpy as np
import pandas as pd


def apply_transaction_costs(
    gross_returns: pd.Series,
    positions: pd.Series,
    commission_bps: float = 1.0,
    spread_bps: float = 2.0,
    market_impact_bps: float = 5.0,
    annual_borrow_cost_pct: float = 0.5,
) -> pd.DataFrame:
    """
    Apply realistic transaction costs to a strategy.

    Parameters
    ----------
    gross_returns : pd.Series
        Gross strategy returns before costs.
    positions : pd.Series
        Position sizes (absolute notional or shares). Used to compute turnover.
    commission_bps : float
        Commission per trade in basis points.
    spread_bps : float
        Half-spread cost in basis points.
    market_impact_bps : float
        Market impact per trade in basis points.
        Rule of thumb: 5-20 bps for liquid equities, 20-100 for small caps.
    annual_borrow_cost_pct : float
        Annual cost of short positions as percentage.

    Returns
    -------
    pd.DataFrame
        Columns: gross_return, turnover, cost, net_return, cumulative_net

    WARNING: Underestimating transaction costs is the #1 reason backtests
    don't translate to live performance. Always err on the high side.
    """
    turnover = positions.diff().abs() / positions.abs().replace(0, np.nan)
    turnover = turnover.fillna(0).clip(upper=2.0)

    # Per-trade costs (applied on turnover)
    trade_cost = turnover * (commission_bps + spread_bps + market_impact_bps) / 10_000

    # Short borrow costs (applied daily on short positions)
    is_short = (positions < 0).astype(float)
    daily_borrow = is_short * annual_borrow_cost_pct / 100 / 252

    total_cost = trade_cost + daily_borrow
    net_returns = gross_returns - total_cost

    result = pd.DataFrame({
        "gross_return": gross_returns,
        "turnover": turnover,
        "cost": total_cost,
        "net_return": net_returns,
        "cumulative_gross": (1 + gross_returns).cumprod(),
        "cumulative_net": (1 + net_returns).cumprod(),
    })

    # Summary statistics
    annual_cost_drag = total_cost.mean() * 252 * 100
    result.attrs["annual_cost_drag_pct"] = round(annual_cost_drag, 2)
    result.attrs["avg_daily_turnover"] = round(turnover.mean(), 4)

    return result
```

**Usage:**
```python
result = apply_transaction_costs(gross_rets, positions, market_impact_bps=10)
print(f"Annual cost drag: {result.attrs['annual_cost_drag_pct']:.1f}%")
print(f"Gross Sharpe: {gross_sharpe:.2f} → Net Sharpe: {net_sharpe:.2f}")
```
