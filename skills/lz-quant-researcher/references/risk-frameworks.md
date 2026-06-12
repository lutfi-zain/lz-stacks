# Risk Management Frameworks

> "Risk management is not about avoiding risk. It's about taking the *right* risks, at the *right* size, with the *right* hedges." — Every surviving quant

---

## 1. Value at Risk (VaR)

Three methods, increasing in sophistication. VaR answers: "What is the maximum loss at a given confidence level over a given time horizon?"

```python
"""Value at Risk — Historical, Parametric, and Monte Carlo methods."""
import numpy as np
import pandas as pd
from scipy import stats


def var_historical(returns: pd.Series, confidence: float = 0.95) -> float:
    """
    Historical VaR: Simply the percentile of realized returns.

    Pros: No distributional assumptions, captures fat tails.
    Cons: Limited by sample size, assumes future ≈ past.
    """
    return float(-np.percentile(returns.dropna(), (1 - confidence) * 100))


def var_parametric(returns: pd.Series, confidence: float = 0.95) -> float:
    """
    Parametric (Gaussian) VaR: Assumes normal distribution.

    Pros: Simple, fast.
    Cons: Underestimates tail risk (markets have fat tails).
    WARNING: This WILL underestimate risk in crises.
    """
    mu = returns.mean()
    sigma = returns.std()
    z = stats.norm.ppf(1 - confidence)
    return float(-(mu + z * sigma))


def var_monte_carlo(
    returns: pd.Series,
    confidence: float = 0.95,
    n_simulations: int = 10_000,
    horizon_days: int = 1,
) -> float:
    """
    Monte Carlo VaR: Simulates future return paths.

    Uses Student-t distribution to better capture fat tails.
    """
    # Fit Student-t distribution (captures fat tails better than Gaussian)
    params = stats.t.fit(returns.dropna())
    df_t, loc, scale = params

    simulated = stats.t.rvs(df_t, loc=loc, scale=scale, size=(n_simulations, horizon_days))
    portfolio_returns = simulated.sum(axis=1)  # cumulative over horizon

    return float(-np.percentile(portfolio_returns, (1 - confidence) * 100))


def var_report(returns: pd.Series, confidence: float = 0.95) -> dict:
    """Generate a comprehensive VaR report using all three methods."""
    return {
        "confidence": confidence,
        "historical_var": round(var_historical(returns, confidence) * 100, 3),
        "parametric_var": round(var_parametric(returns, confidence) * 100, 3),
        "monte_carlo_var": round(var_monte_carlo(returns, confidence) * 100, 3),
        "sample_size": len(returns.dropna()),
        "note": "Values in percentage. Parametric VaR underestimates tail risk.",
    }
```

---

## 2. Conditional VaR (CVaR / Expected Shortfall)

CVaR is what you *actually* care about: "Given that we're in the tail, how bad is it?"

```python
"""Conditional VaR (Expected Shortfall) — the expected loss beyond VaR."""
import numpy as np
import pandas as pd


def cvar(returns: pd.Series, confidence: float = 0.95) -> float:
    """
    CVaR (Expected Shortfall): Average loss in the worst (1-confidence)% of cases.

    CVaR is a coherent risk measure (VaR is not).
    - Subadditive: CVaR(A+B) <= CVaR(A) + CVaR(B) — diversification reduces CVaR.
    - Basel III requires CVaR (not VaR) for bank capital requirements.
    """
    var_threshold = np.percentile(returns.dropna(), (1 - confidence) * 100)
    tail_losses = returns[returns <= var_threshold]
    return float(-tail_losses.mean())


def risk_budget(
    returns_dict: dict,
    confidence: float = 0.95,
    total_capital: float = 1_000_000,
) -> pd.DataFrame:
    """
    Compute CVaR-based risk budget for a portfolio of strategies.

    Parameters
    ----------
    returns_dict : dict
        {"strategy_name": pd.Series of returns}
    total_capital : float
        Total portfolio capital.

    Returns
    -------
    pd.DataFrame
        CVaR by strategy, as dollar amount and percentage of total.
    """
    results = []
    for name, rets in returns_dict.items():
        strategy_cvar = cvar(rets, confidence)
        results.append({
            "strategy": name,
            "cvar_pct": round(strategy_cvar * 100, 3),
            "cvar_dollar": round(strategy_cvar * total_capital, 0),
            "annualized_vol": round(rets.std() * np.sqrt(252) * 100, 2),
        })
    return pd.DataFrame(results)
```

---

## 3. Position Sizing — Kelly Criterion

The mathematically optimal bet size for maximizing long-term geometric growth. In practice, always use fractional Kelly.

```python
"""Kelly Criterion and fractional Kelly position sizing."""
import numpy as np
import pandas as pd


def kelly_fraction(
    win_rate: float,
    avg_win: float,
    avg_loss: float,
) -> float:
    """
    Calculate full Kelly fraction for a binary outcome strategy.

    Kelly% = W/A - (1-W)/B
    Where:
      W = win rate
      A = average win size
      B = average loss size (positive number)

    WARNING: Full Kelly is extremely aggressive. Live trading should use
    half-Kelly (÷2) or quarter-Kelly (÷4) for survival.
    """
    if avg_loss <= 0 or avg_win <= 0:
        return 0.0
    kelly = win_rate / avg_loss - (1 - win_rate) / avg_win
    return max(kelly, 0.0)  # Never go negative (don't reverse the trade)


def kelly_continuous(
    returns: pd.Series,
) -> dict:
    """
    Continuous Kelly for normally-distributed returns.

    Kelly fraction = μ / σ² (Sharpe² for unit variance)

    This is the fraction of capital to allocate to the strategy.
    """
    mu = returns.mean()
    var = returns.var()
    if var <= 0:
        return {"full_kelly": 0, "half_kelly": 0, "quarter_kelly": 0}

    full = mu / var
    return {
        "full_kelly": round(full, 4),
        "half_kelly": round(full / 2, 4),
        "quarter_kelly": round(full / 4, 4),
        "expected_growth_full": round(mu - var / 2, 6),
        "expected_growth_half": round(mu * 0.5 - var * 0.25 / 2, 6),
        "recommendation": (
            "Use HALF-KELLY for live trading. Full Kelly has too much "
            "variance and relies on exact parameter estimation, which "
            "you don't have."
        ),
    }


def position_size_fixed_fractional(
    capital: float,
    risk_per_trade_pct: float,
    entry_price: float,
    stop_loss_price: float,
) -> dict:
    """
    Fixed fractional position sizing — risk a fixed % of capital per trade.

    This is the simplest and most robust position sizing method.
    Typical risk_per_trade_pct: 0.5% to 2.0%.
    """
    risk_per_share = abs(entry_price - stop_loss_price)
    if risk_per_share <= 0:
        return {"shares": 0, "error": "Stop loss must differ from entry"}

    dollar_risk = capital * (risk_per_trade_pct / 100)
    shares = int(dollar_risk / risk_per_share)
    position_value = shares * entry_price
    position_pct = position_value / capital * 100

    return {
        "shares": shares,
        "position_value": round(position_value, 2),
        "position_pct_of_capital": round(position_pct, 2),
        "dollar_risk": round(dollar_risk, 2),
        "risk_per_share": round(risk_per_share, 2),
    }
```

---

## 4. Risk Parity Portfolio Construction

```python
"""Risk parity: equalize risk contribution across assets."""
import numpy as np
import pandas as pd
from scipy.optimize import minimize


def risk_parity_weights(
    returns: pd.DataFrame,
    target_vol: float = 0.10,
) -> dict:
    """
    Compute risk parity weights — each asset contributes equal risk.

    Based on Bridgewater's All Weather approach.
    Risk contribution_i = w_i * (Σw)_i / σ_portfolio

    Parameters
    ----------
    returns : pd.DataFrame
        Daily returns, each column is an asset.
    target_vol : float
        Target annualized portfolio volatility.

    Returns
    -------
    dict
        Weights, risk contributions, and portfolio statistics.
    """
    cov = returns.cov() * 252  # Annualized covariance
    n = len(returns.columns)

    def risk_contribution(weights):
        port_vol = np.sqrt(weights @ cov.values @ weights)
        marginal_risk = cov.values @ weights
        risk_contrib = weights * marginal_risk / port_vol
        return risk_contrib

    def objective(weights):
        rc = risk_contribution(weights)
        target_rc = np.ones(n) / n  # Equal risk contribution
        return np.sum((rc - target_rc) ** 2)

    constraints = [{"type": "eq", "fun": lambda w: np.sum(w) - 1}]
    bounds = [(0.01, 0.99)] * n
    x0 = np.ones(n) / n

    result = minimize(objective, x0, method="SLSQP",
                      bounds=bounds, constraints=constraints)

    weights = result.x
    port_vol = np.sqrt(weights @ cov.values @ weights)
    leverage = target_vol / port_vol if port_vol > 0 else 1.0

    return {
        "weights": {col: round(w * leverage, 4) for col, w in zip(returns.columns, weights)},
        "unlevered_weights": {col: round(w, 4) for col, w in zip(returns.columns, weights)},
        "risk_contributions": {col: round(rc, 4) for col, rc in zip(returns.columns, risk_contribution(weights))},
        "portfolio_vol": round(port_vol, 4),
        "leverage": round(leverage, 2),
        "target_vol": target_vol,
    }
```

---

## 5. Stress Testing

```python
"""Historical and hypothetical stress testing for portfolios."""
import pandas as pd
import numpy as np


# Historical crisis periods (approximate)
HISTORICAL_CRISES = {
    "dot_com_crash": ("2000-03-10", "2002-10-09"),
    "gfc_2008": ("2007-10-09", "2009-03-09"),
    "flash_crash_2010": ("2010-05-06", "2010-05-07"),
    "eu_debt_crisis": ("2011-07-22", "2011-10-03"),
    "china_deval_2015": ("2015-08-11", "2015-08-25"),
    "covid_crash_2020": ("2020-02-19", "2020-03-23"),
    "rate_hike_2022": ("2022-01-03", "2022-10-12"),
}


def historical_stress_test(
    returns: pd.Series,
    crises: dict = None,
) -> pd.DataFrame:
    """
    Test strategy performance during historical crisis periods.

    Returns
    -------
    pd.DataFrame
        Crisis name, period, cumulative return, max drawdown, and number of days.
    """
    if crises is None:
        crises = HISTORICAL_CRISES

    results = []
    for name, (start, end) in crises.items():
        try:
            crisis_returns = returns.loc[start:end]
            if len(crisis_returns) == 0:
                continue
            cum_return = (1 + crisis_returns).prod() - 1
            max_dd = _max_drawdown(crisis_returns)
            results.append({
                "crisis": name,
                "start": start,
                "end": end,
                "cumulative_return_pct": round(cum_return * 100, 2),
                "max_drawdown_pct": round(max_dd * 100, 2),
                "trading_days": len(crisis_returns),
            })
        except KeyError:
            continue

    return pd.DataFrame(results)


def hypothetical_stress_test(
    portfolio_value: float,
    weights: dict,
    scenarios: dict = None,
) -> pd.DataFrame:
    """
    Test portfolio against hypothetical shock scenarios.

    Parameters
    ----------
    portfolio_value : float
        Current portfolio value.
    weights : dict
        {"asset_class": weight}
    scenarios : dict
        {"scenario_name": {"asset_class": shock_pct}}
    """
    if scenarios is None:
        scenarios = {
            "rates_up_200bps": {"equities": -0.15, "bonds": -0.12, "commodities": 0.05, "gold": 0.03},
            "equity_crash_30pct": {"equities": -0.30, "bonds": 0.05, "commodities": -0.15, "gold": 0.10},
            "stagflation": {"equities": -0.20, "bonds": -0.10, "commodities": 0.25, "gold": 0.15},
            "deflation": {"equities": -0.25, "bonds": 0.15, "commodities": -0.30, "gold": -0.05},
            "pandemic": {"equities": -0.35, "bonds": 0.08, "commodities": -0.20, "gold": 0.05},
        }

    results = []
    for scenario_name, shocks in scenarios.items():
        portfolio_pnl = 0
        for asset, weight in weights.items():
            shock = shocks.get(asset, 0)
            portfolio_pnl += weight * shock

        results.append({
            "scenario": scenario_name,
            "portfolio_return_pct": round(portfolio_pnl * 100, 2),
            "dollar_pnl": round(portfolio_value * portfolio_pnl, 0),
            "survives": portfolio_pnl > -0.20,  # Survive = less than 20% loss
        })

    return pd.DataFrame(results)


def _max_drawdown(returns: pd.Series) -> float:
    """Calculate maximum drawdown from a return series."""
    cumulative = (1 + returns).cumprod()
    peak = cumulative.expanding().max()
    drawdown = (cumulative - peak) / peak
    return float(drawdown.min())
```

---

## 6. Drawdown Analysis

```python
"""Comprehensive drawdown analysis for strategy evaluation."""
import pandas as pd
import numpy as np
from dataclasses import dataclass
from typing import List


@dataclass
class DrawdownPeriod:
    """A single drawdown event."""
    start: pd.Timestamp
    trough: pd.Timestamp
    recovery: pd.Timestamp  # NaT if not yet recovered
    depth_pct: float
    duration_days: int
    recovery_days: int  # -1 if not recovered


def analyze_drawdowns(
    returns: pd.Series,
    top_n: int = 5,
) -> dict:
    """
    Comprehensive drawdown analysis.

    Returns
    -------
    dict
        max_drawdown, average_drawdown, top_N drawdown periods,
        time_underwater statistics, and calmar ratio.
    """
    cumulative = (1 + returns).cumprod()
    peak = cumulative.expanding().max()
    drawdown = (cumulative - peak) / peak

    # Find individual drawdown periods
    is_underwater = drawdown < 0
    periods = []
    start = None

    for i, (date, dd) in enumerate(drawdown.items()):
        if dd < 0 and start is None:
            start = date
        elif dd >= 0 and start is not None:
            trough_idx = drawdown.loc[start:date].idxmin()
            periods.append(DrawdownPeriod(
                start=start,
                trough=trough_idx,
                recovery=date,
                depth_pct=round(float(drawdown.loc[trough_idx]) * 100, 2),
                duration_days=(date - start).days,
                recovery_days=(date - trough_idx).days,
            ))
            start = None

    # Handle ongoing drawdown
    if start is not None:
        trough_idx = drawdown.loc[start:].idxmin()
        periods.append(DrawdownPeriod(
            start=start,
            trough=trough_idx,
            recovery=pd.NaT,
            depth_pct=round(float(drawdown.loc[trough_idx]) * 100, 2),
            duration_days=(drawdown.index[-1] - start).days,
            recovery_days=-1,
        ))

    # Sort by depth
    periods.sort(key=lambda p: p.depth_pct)

    # Calmar ratio = annualized return / max drawdown
    annual_return = (cumulative.iloc[-1] ** (252 / len(returns))) - 1
    max_dd = abs(drawdown.min())
    calmar = annual_return / max_dd if max_dd > 0 else float("inf")

    # Time underwater
    underwater_pct = is_underwater.mean() * 100

    return {
        "max_drawdown_pct": round(float(drawdown.min()) * 100, 2),
        "avg_drawdown_pct": round(float(drawdown[is_underwater].mean()) * 100, 2),
        "time_underwater_pct": round(underwater_pct, 1),
        "calmar_ratio": round(calmar, 2),
        "num_drawdown_periods": len(periods),
        "top_drawdowns": periods[:top_n],
        "longest_recovery_days": max((p.recovery_days for p in periods if p.recovery_days > 0), default=0),
    }
```
