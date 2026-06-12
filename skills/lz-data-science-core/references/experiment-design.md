# Experiment Design — Reference

Frameworks for designing, running, and analyzing experiments. Covers A/B testing, multi-armed bandits, causal inference, and common pitfalls.

---

## 1. A/B Testing Protocol

### Step 1: Hypothesis Formulation

Always write the hypothesis **before** looking at data.

```
H₀ (Null):      The new [feature/change] has NO effect on [metric].
H₁ (Alternative): The new [feature/change] [increases/decreases] [metric] by at least [MDE].

Primary metric:    [e.g., 7-day retention rate]
Secondary metrics: [e.g., revenue per user, session duration]
Guardrail metrics: [e.g., page load time, error rate — must not degrade]
```

**MDE (Minimum Detectable Effect):** The smallest effect size worth detecting. This is a business decision, not a statistical one. Ask: *"What's the smallest improvement that would justify the engineering cost of shipping this?"*

### Step 2: Sample Size Calculation (Power Analysis)

```python
from scipy import stats
import numpy as np


def sample_size_proportion(p_control: float, mde: float,
                            alpha: float = 0.05, power: float = 0.80) -> int:
    """Sample size per group for a two-proportion z-test.

    Args:
        p_control: Baseline conversion rate (e.g., 0.12 for 12%)
        mde: Minimum detectable effect as absolute difference (e.g., 0.02 for 2pp)
        alpha: Significance level (Type I error rate)
        power: Statistical power (1 - Type II error rate)

    Returns:
        Required sample size per group.
    """
    p_treatment = p_control + mde
    p_pooled = (p_control + p_treatment) / 2

    z_alpha = stats.norm.ppf(1 - alpha / 2)
    z_beta = stats.norm.ppf(power)

    n = ((z_alpha * np.sqrt(2 * p_pooled * (1 - p_pooled))
          + z_beta * np.sqrt(p_control * (1 - p_control)
                              + p_treatment * (1 - p_treatment)))
         / mde) ** 2
    return int(np.ceil(n))


def sample_size_continuous(mu_diff: float, std: float,
                            alpha: float = 0.05, power: float = 0.80) -> int:
    """Sample size per group for a two-sample t-test.

    Args:
        mu_diff: Expected difference in means (MDE)
        std: Pooled standard deviation estimate
        alpha: Significance level
        power: Statistical power

    Returns:
        Required sample size per group.
    """
    z_alpha = stats.norm.ppf(1 - alpha / 2)
    z_beta = stats.norm.ppf(power)
    n = 2 * ((z_alpha + z_beta) * std / mu_diff) ** 2
    return int(np.ceil(n))


# Example: Baseline conversion = 12%, want to detect 2pp lift
n = sample_size_proportion(p_control=0.12, mde=0.02)
print(f"Need {n:,} users per group ({2*n:,} total)")
# Output: Need ~3,623 users per group (7,246 total)
```

### Step 3: Duration Estimation

```python
def experiment_duration(n_per_group: int, daily_traffic: int,
                         traffic_fraction: float = 1.0) -> int:
    """Estimate how many days the experiment needs to run.

    Args:
        n_per_group: Required sample size per group
        daily_traffic: Average daily eligible users
        traffic_fraction: Fraction of traffic allocated to experiment (e.g., 0.5)

    Returns:
        Minimum days to run. Always round UP to full weeks to capture weekly cycles.
    """
    users_per_day = daily_traffic * traffic_fraction / 2  # split between control/treatment
    days = int(np.ceil(n_per_group / users_per_day))
    # Round up to full weeks to capture day-of-week effects
    weeks = int(np.ceil(days / 7))
    return max(weeks * 7, 14)  # Minimum 2 weeks
```

### Step 4: Statistical Analysis

```python
def analyze_ab_proportion(n_control: int, conv_control: int,
                           n_treatment: int, conv_treatment: int,
                           alpha: float = 0.05) -> dict:
    """Analyze A/B test results for conversion rate (proportions).

    Uses a two-proportion z-test.
    """
    p_c = conv_control / n_control
    p_t = conv_treatment / n_treatment
    p_pooled = (conv_control + conv_treatment) / (n_control + n_treatment)

    se = np.sqrt(p_pooled * (1 - p_pooled) * (1/n_control + 1/n_treatment))
    z_stat = (p_t - p_c) / se
    p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))

    # Confidence interval for the difference
    se_diff = np.sqrt(p_c * (1 - p_c) / n_control + p_t * (1 - p_t) / n_treatment)
    z_crit = stats.norm.ppf(1 - alpha / 2)
    ci_lower = (p_t - p_c) - z_crit * se_diff
    ci_upper = (p_t - p_c) + z_crit * se_diff

    return {
        "control_rate": round(p_c, 6),
        "treatment_rate": round(p_t, 6),
        "absolute_lift": round(p_t - p_c, 6),
        "relative_lift_pct": round((p_t - p_c) / p_c * 100, 2) if p_c > 0 else None,
        "z_statistic": round(z_stat, 4),
        "p_value": round(p_value, 6),
        "significant": p_value < alpha,
        "ci_95": (round(ci_lower, 6), round(ci_upper, 6)),
    }


def analyze_ab_continuous(control: np.ndarray, treatment: np.ndarray,
                           alpha: float = 0.05) -> dict:
    """Analyze A/B test results for continuous metrics (means).

    Uses Welch's t-test (unequal variances).
    """
    t_stat, p_value = stats.ttest_ind(treatment, control, equal_var=False)
    mean_c, mean_t = control.mean(), treatment.mean()

    # Bootstrap CI for the difference
    rng = np.random.default_rng(42)
    boot_diffs = []
    for _ in range(10_000):
        bc = rng.choice(control, size=len(control), replace=True)
        bt = rng.choice(treatment, size=len(treatment), replace=True)
        boot_diffs.append(bt.mean() - bc.mean())
    ci_lower, ci_upper = np.percentile(boot_diffs, [2.5, 97.5])

    return {
        "control_mean": round(float(mean_c), 4),
        "treatment_mean": round(float(mean_t), 4),
        "absolute_lift": round(float(mean_t - mean_c), 4),
        "relative_lift_pct": round((mean_t - mean_c) / mean_c * 100, 2) if mean_c != 0 else None,
        "t_statistic": round(float(t_stat), 4),
        "p_value": round(float(p_value), 6),
        "significant": p_value < alpha,
        "ci_95_bootstrap": (round(float(ci_lower), 4), round(float(ci_upper), 4)),
    }
```

---

## 2. Multi-Armed Bandit (MAB)

Use MAB instead of A/B when:
- You have many variants (>2) and can't afford equal traffic to each
- Opportunity cost of serving the worse variant is high
- You want to **exploit** the best option quickly, not just **measure**

| Algorithm | How it works | Best for |
| --- | --- | --- |
| **Epsilon-Greedy** | Exploit best arm (1-ε) of the time; explore random arm ε of the time | Simple, when ε is tunable |
| **UCB (Upper Confidence Bound)** | Pick arm with highest `mean + c·sqrt(ln(t)/n_i)` | When you want theoretical guarantees |
| **Thompson Sampling** | Sample from posterior (Beta distribution for Bernoulli), pick highest sample | Best general-purpose MAB; naturally balances explore/exploit |

```python
def thompson_sampling_step(successes: list[int], failures: list[int]) -> int:
    """One step of Thompson Sampling for Bernoulli rewards.

    Args:
        successes: List of success counts per arm
        failures: List of failure counts per arm

    Returns:
        Index of the arm to pull next.
    """
    samples = [np.random.beta(s + 1, f + 1) for s, f in zip(successes, failures)]
    return int(np.argmax(samples))
```

### MAB vs A/B Decision Guide

| Criterion | A/B Test | Multi-Armed Bandit |
| --- | --- | --- |
| Goal | Measure effect with statistical rigor | Maximize reward while learning |
| Variants | 2-3 | 3+ |
| Traffic cost | Acceptable (50/50 split) | High (want to minimize regret) |
| Duration | Fixed (pre-calculated) | Adaptive (converges) |
| Statistical guarantees | Strong (Type I/II error control) | Weaker (but improving — see Bayesian MAB) |
| Recommended for | Product decisions, pricing changes | Headline/creative optimization, recommendations |

---

## 3. Causal Inference Basics

When you can't randomize (observational data only), use these quasi-experimental methods:

### Difference-in-Differences (DiD)

Compares the change in outcome between treatment and control groups, before and after an intervention.

```python
def diff_in_diff(df: pd.DataFrame, group_col: str, time_col: str,
                  outcome_col: str, treatment_group: str,
                  pre_period: str, post_period: str) -> dict:
    """Simple Difference-in-Differences estimator.

    Assumes df has columns for group assignment, time period, and outcome.
    """
    pre_treat = df[(df[group_col] == treatment_group) & (df[time_col] == pre_period)][outcome_col].mean()
    post_treat = df[(df[group_col] == treatment_group) & (df[time_col] == post_period)][outcome_col].mean()
    pre_control = df[(df[group_col] != treatment_group) & (df[time_col] == pre_period)][outcome_col].mean()
    post_control = df[(df[group_col] != treatment_group) & (df[time_col] == post_period)][outcome_col].mean()

    did_estimate = (post_treat - pre_treat) - (post_control - pre_control)

    return {
        "treatment_change": round(post_treat - pre_treat, 4),
        "control_change": round(post_control - pre_control, 4),
        "did_estimate": round(did_estimate, 4),
        "interpretation": f"Causal effect estimate: {did_estimate:.4f} (assumes parallel trends)",
    }
```

**Key assumption:** Parallel trends — without intervention, treatment and control would have followed the same trajectory. Always plot pre-period trends to validate.

### Propensity Score Matching (PSM)

Matches treated units to control units with similar probability of being treated.

```python
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import NearestNeighbors


def propensity_score_match(df: pd.DataFrame, treatment_col: str,
                            covariate_cols: list[str],
                            n_neighbors: int = 1) -> pd.DataFrame:
    """Match treated to control units using propensity scores."""
    X = df[covariate_cols].fillna(0)
    y = df[treatment_col]

    # Estimate propensity scores
    model = LogisticRegression(max_iter=1000, random_state=42)
    model.fit(X, y)
    df = df.copy()
    df["propensity_score"] = model.predict_proba(X)[:, 1]

    # Match treated to nearest control
    treated = df[df[treatment_col] == 1]
    control = df[df[treatment_col] == 0]

    nn = NearestNeighbors(n_neighbors=n_neighbors, metric="euclidean")
    nn.fit(control[["propensity_score"]])
    distances, indices = nn.kneighbors(treated[["propensity_score"]])

    matched_control = control.iloc[indices.flatten()]
    matched = pd.concat([treated.reset_index(drop=True),
                          matched_control.reset_index(drop=True)],
                         keys=["treated", "control"])
    return matched
```

---

## 4. Common Pitfalls

### Peeking (Repeated Significance Testing)

**Problem:** Checking p-values daily and stopping when p < 0.05 inflates Type I error to 20-30%.

**Fix:** Pre-commit to a fixed sample size. Or use sequential testing methods (SPRT, always-valid p-values) that are designed for continuous monitoring.

### Novelty / Primacy Effects

**Problem:** Users engage more with a new feature simply because it's new (novelty) or stick with what they know (primacy).

**Fix:** Run the experiment long enough (minimum 2-4 weeks). Segment by new vs. returning users. Check if the effect decays over time.

### Simpson's Paradox

**Problem:** A trend that appears in all subgroups reverses when subgroups are combined.

**Fix:** Always analyze by segment. If desktop and mobile both show negative results but the aggregate is positive, the aggregate is misleading.

### Multiple Testing Correction

When testing multiple hypotheses, the chance of at least one false positive increases.

```python
def bonferroni_correction(p_values: list[float], alpha: float = 0.05) -> list[dict]:
    """Bonferroni correction for multiple hypothesis tests."""
    n = len(p_values)
    adjusted_alpha = alpha / n
    return [
        {"original_p": round(p, 6),
         "adjusted_alpha": round(adjusted_alpha, 6),
         "significant": p < adjusted_alpha}
        for p in p_values
    ]


def holm_bonferroni(p_values: list[float], alpha: float = 0.05) -> list[dict]:
    """Holm-Bonferroni step-down method — more powerful than Bonferroni."""
    n = len(p_values)
    indexed = sorted(enumerate(p_values), key=lambda x: x[1])
    results = [None] * n
    rejected_so_far = True
    for rank, (orig_idx, p) in enumerate(indexed):
        adjusted_alpha = alpha / (n - rank)
        is_sig = rejected_so_far and (p < adjusted_alpha)
        if not is_sig:
            rejected_so_far = False
        results[orig_idx] = {
            "original_p": round(p, 6),
            "adjusted_alpha": round(adjusted_alpha, 6),
            "significant": is_sig,
        }
    return results
```
