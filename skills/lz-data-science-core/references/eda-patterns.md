# EDA Patterns — Production Python Reference

Complete, runnable functions for exploratory data analysis. Each pattern uses only `pandas`, `numpy`, `matplotlib`, and `seaborn` — the standard DS stack.

## Setup

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

sns.set_theme(style="whitegrid", palette="viridis")
plt.rcParams["figure.figsize"] = (10, 6)
plt.rcParams["figure.dpi"] = 100
```

---

## 1. Dataset Profiling

```python
def profile_dataset(df: pd.DataFrame) -> dict:
    """Generate a comprehensive profile of the dataset."""
    profile = {
        "shape": df.shape,
        "memory_mb": df.memory_usage(deep=True).sum() / 1e6,
        "dtypes": df.dtypes.value_counts().to_dict(),
        "columns": {},
    }
    for col in df.columns:
        col_info = {
            "dtype": str(df[col].dtype),
            "null_count": int(df[col].isna().sum()),
            "null_pct": round(df[col].isna().mean() * 100, 2),
            "n_unique": int(df[col].nunique()),
            "cardinality_ratio": round(df[col].nunique() / len(df), 4),
        }
        if pd.api.types.is_numeric_dtype(df[col]):
            col_info.update({
                "mean": round(df[col].mean(), 4),
                "median": round(df[col].median(), 4),
                "std": round(df[col].std(), 4),
                "min": df[col].min(),
                "max": df[col].max(),
                "skew": round(df[col].skew(), 4),
                "kurtosis": round(df[col].kurtosis(), 4),
                "zeros_pct": round((df[col] == 0).mean() * 100, 2),
            })
        elif pd.api.types.is_string_dtype(df[col]) or df[col].dtype.name == "category":
            top = df[col].value_counts().head(5)
            col_info["top_values"] = top.to_dict()
            col_info["top_pct"] = round(top.iloc[0] / len(df) * 100, 2) if len(top) > 0 else 0
        profile["columns"][col] = col_info
    return profile


def print_profile(profile: dict) -> None:
    """Pretty-print a dataset profile."""
    print(f"Shape: {profile['shape'][0]:,} rows × {profile['shape'][1]} columns")
    print(f"Memory: {profile['memory_mb']:.2f} MB")
    print(f"Dtypes: {profile['dtypes']}")
    print(f"\n{'Column':<30} {'Type':<12} {'Nulls':<10} {'Unique':<10} {'Notes'}")
    print("-" * 85)
    for col, info in profile["columns"].items():
        notes = ""
        if info["null_pct"] > 50:
            notes += "⚠️ >50% null "
        if info["cardinality_ratio"] > 0.95:
            notes += "🔑 high cardinality "
        if info.get("skew") and abs(info["skew"]) > 2:
            notes += f"📐 skew={info['skew']} "
        null_str = f"{info['null_count']} ({info['null_pct']}%)"
        print(f"{col:<30} {info['dtype']:<12} {null_str:<10} {info['n_unique']:<10} {notes}")
```

---

## 2. Distribution Analysis

```python
def plot_numeric_distributions(df: pd.DataFrame, cols: list[str] = None,
                                ncols: int = 3) -> None:
    """Plot histogram + KDE + boxplot for numeric columns."""
    if cols is None:
        cols = df.select_dtypes(include="number").columns.tolist()
    nrows = (len(cols) + ncols - 1) // ncols
    fig, axes = plt.subplots(nrows * 2, ncols, figsize=(5 * ncols, 4 * nrows * 2))
    axes = np.atleast_2d(axes)

    for i, col in enumerate(cols):
        row_hist = (i // ncols) * 2
        row_box = row_hist + 1
        col_idx = i % ncols

        # Histogram + KDE
        ax_hist = axes[row_hist, col_idx]
        data = df[col].dropna()
        ax_hist.hist(data, bins=50, density=True, alpha=0.6, edgecolor="white")
        if len(data) > 1:
            try:
                data.plot.kde(ax=ax_hist, color="red", linewidth=2)
            except Exception:
                pass
        ax_hist.set_title(f"{col} — Distribution")
        ax_hist.set_xlabel("")

        # Boxplot
        ax_box = axes[row_box, col_idx]
        ax_box.boxplot(data, vert=False, widths=0.7)
        ax_box.set_title(f"{col} — Boxplot")

    # Hide unused subplots
    for j in range(len(cols), nrows * ncols):
        axes[(j // ncols) * 2, j % ncols].set_visible(False)
        axes[(j // ncols) * 2 + 1, j % ncols].set_visible(False)

    plt.tight_layout()
    plt.show()


def plot_qq(df: pd.DataFrame, col: str) -> None:
    """Q-Q plot to assess normality."""
    data = df[col].dropna()
    fig, ax = plt.subplots(1, 1, figsize=(6, 6))
    stats.probplot(data, dist="norm", plot=ax)
    ax.set_title(f"Q-Q Plot — {col}")
    plt.tight_layout()
    plt.show()
```

---

## 3. Correlation Analysis

```python
def plot_correlation_matrix(df: pd.DataFrame, method: str = "pearson",
                             threshold: float = 0.0) -> pd.DataFrame:
    """Plot correlation heatmap and return highly correlated pairs."""
    numeric_df = df.select_dtypes(include="number")
    corr = numeric_df.corr(method=method)

    mask = np.triu(np.ones_like(corr, dtype=bool))
    fig, ax = plt.subplots(figsize=(max(8, len(corr.columns) * 0.6),
                                     max(6, len(corr.columns) * 0.5)))
    sns.heatmap(corr, mask=mask, annot=len(corr.columns) <= 15,
                fmt=".2f", cmap="RdBu_r", center=0, vmin=-1, vmax=1,
                square=True, linewidths=0.5, ax=ax)
    ax.set_title(f"{method.title()} Correlation Matrix")
    plt.tight_layout()
    plt.show()

    # Extract highly correlated pairs
    pairs = []
    for i in range(len(corr.columns)):
        for j in range(i + 1, len(corr.columns)):
            r = corr.iloc[i, j]
            if abs(r) > threshold:
                pairs.append({
                    "feature_1": corr.columns[i],
                    "feature_2": corr.columns[j],
                    "correlation": round(r, 4),
                })
    return pd.DataFrame(pairs).sort_values("correlation", key=abs, ascending=False)


def cramers_v(x: pd.Series, y: pd.Series) -> float:
    """Cramér's V for association between two categorical variables."""
    confusion = pd.crosstab(x, y)
    chi2 = stats.chi2_contingency(confusion)[0]
    n = confusion.sum().sum()
    min_dim = min(confusion.shape) - 1
    if min_dim == 0 or n == 0:
        return 0.0
    return np.sqrt(chi2 / (n * min_dim))


def categorical_correlation_matrix(df: pd.DataFrame,
                                    cols: list[str] = None) -> pd.DataFrame:
    """Cramér's V matrix for categorical columns."""
    if cols is None:
        cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
    matrix = pd.DataFrame(index=cols, columns=cols, dtype=float)
    for i, c1 in enumerate(cols):
        for j, c2 in enumerate(cols):
            if i <= j:
                v = cramers_v(df[c1].fillna("_MISSING_"), df[c2].fillna("_MISSING_"))
                matrix.loc[c1, c2] = round(v, 4)
                matrix.loc[c2, c1] = round(v, 4)
    return matrix
```

---

## 4. Missing Data Analysis

```python
def analyze_missing(df: pd.DataFrame) -> pd.DataFrame:
    """Comprehensive missing data analysis."""
    missing = df.isna().sum()
    missing = missing[missing > 0].sort_values(ascending=False)
    if len(missing) == 0:
        print("✅ No missing values found.")
        return pd.DataFrame()

    result = pd.DataFrame({
        "column": missing.index,
        "missing_count": missing.values,
        "missing_pct": (missing.values / len(df) * 100).round(2),
        "dtype": [str(df[c].dtype) for c in missing.index],
    })

    # Visualize missingness pattern
    fig, axes = plt.subplots(1, 2, figsize=(14, max(4, len(missing) * 0.3)))

    # Bar chart
    axes[0].barh(result["column"], result["missing_pct"], color="coral")
    axes[0].set_xlabel("Missing %")
    axes[0].set_title("Missing Values by Column")
    axes[0].invert_yaxis()

    # Nullity matrix (sample up to 500 rows for readability)
    sample = df[missing.index].sample(min(500, len(df)), random_state=42)
    axes[1].imshow(sample.isna(), aspect="auto", cmap="Greys", interpolation="none")
    axes[1].set_xticks(range(len(missing.index)))
    axes[1].set_xticklabels(missing.index, rotation=90, fontsize=8)
    axes[1].set_title("Nullity Pattern (sample)")

    plt.tight_layout()
    plt.show()
    return result


def detect_missing_mechanism(df: pd.DataFrame, target_col: str,
                              test_col: str) -> str:
    """Heuristic test for MCAR vs MAR vs MNAR.

    - MCAR: missingness is independent of all other variables
    - MAR: missingness depends on observed variables (not the missing var itself)
    - MNAR: missingness depends on the missing value itself

    Returns a heuristic classification (not a definitive statistical test).
    """
    is_missing = df[target_col].isna()
    if is_missing.sum() == 0 or is_missing.sum() == len(df):
        return "N/A (no variation in missingness)"

    # Test if missingness correlates with the test column
    if pd.api.types.is_numeric_dtype(df[test_col]):
        group_present = df.loc[~is_missing, test_col].dropna()
        group_missing = df.loc[is_missing, test_col].dropna()
        if len(group_present) > 1 and len(group_missing) > 1:
            _, p_value = stats.mannwhitneyu(group_present, group_missing,
                                             alternative="two-sided")
            if p_value < 0.05:
                return f"Likely MAR (missingness of '{target_col}' correlates with '{test_col}', p={p_value:.4f})"
    return f"No evidence against MCAR ('{target_col}' vs '{test_col}')"
```

---

## 5. Outlier Detection

```python
def detect_outliers_iqr(df: pd.DataFrame, cols: list[str] = None,
                         factor: float = 1.5) -> pd.DataFrame:
    """Detect outliers using IQR method."""
    if cols is None:
        cols = df.select_dtypes(include="number").columns.tolist()
    results = []
    for col in cols:
        data = df[col].dropna()
        q1, q3 = data.quantile(0.25), data.quantile(0.75)
        iqr = q3 - q1
        lower, upper = q1 - factor * iqr, q3 + factor * iqr
        outliers = data[(data < lower) | (data > upper)]
        results.append({
            "column": col,
            "q1": round(q1, 4), "q3": round(q3, 4), "iqr": round(iqr, 4),
            "lower_bound": round(lower, 4), "upper_bound": round(upper, 4),
            "outlier_count": len(outliers),
            "outlier_pct": round(len(outliers) / len(data) * 100, 2),
        })
    return pd.DataFrame(results)


def detect_outliers_zscore(df: pd.DataFrame, cols: list[str] = None,
                            threshold: float = 3.0) -> pd.DataFrame:
    """Detect outliers using Z-score method."""
    if cols is None:
        cols = df.select_dtypes(include="number").columns.tolist()
    results = []
    for col in cols:
        data = df[col].dropna()
        z = np.abs(stats.zscore(data))
        outliers = data[z > threshold]
        results.append({
            "column": col,
            "mean": round(data.mean(), 4),
            "std": round(data.std(), 4),
            "threshold": threshold,
            "outlier_count": len(outliers),
            "outlier_pct": round(len(outliers) / len(data) * 100, 2),
        })
    return pd.DataFrame(results)
```

---

## 6. Target Variable Analysis

```python
def analyze_target(df: pd.DataFrame, target: str) -> None:
    """Analyze target variable — works for both classification and regression."""
    data = df[target].dropna()

    if pd.api.types.is_numeric_dtype(data) and data.nunique() > 20:
        # Regression target
        print(f"Target '{target}' — Continuous (Regression)")
        print(f"  Mean: {data.mean():.4f}  |  Median: {data.median():.4f}")
        print(f"  Std:  {data.std():.4f}   |  Skew: {data.skew():.4f}")
        print(f"  Min:  {data.min()}  |  Max: {data.max()}")

        fig, axes = plt.subplots(1, 2, figsize=(12, 4))
        axes[0].hist(data, bins=50, edgecolor="white", alpha=0.7)
        axes[0].set_title(f"{target} — Distribution")
        axes[1].boxplot(data, vert=False)
        axes[1].set_title(f"{target} — Boxplot")
        plt.tight_layout()
        plt.show()
    else:
        # Classification target
        vc = data.value_counts()
        print(f"Target '{target}' — Categorical (Classification)")
        print(f"  Classes: {len(vc)}")
        print(f"  Balance ratio: {vc.min() / vc.max():.4f} (1.0 = perfect)")
        if vc.min() / vc.max() < 0.1:
            print("  ⚠️  SEVERE CLASS IMBALANCE — consider resampling or class weights")
        elif vc.min() / vc.max() < 0.3:
            print("  ⚠️  Moderate imbalance — use stratified splits and AUC-PR metric")

        fig, ax = plt.subplots(figsize=(8, 4))
        vc.plot.bar(ax=ax, edgecolor="white")
        for i, (val, count) in enumerate(vc.items()):
            ax.text(i, count + vc.max() * 0.01, f"{count}\n({count/len(data)*100:.1f}%)",
                    ha="center", fontsize=9)
        ax.set_title(f"Target '{target}' — Class Distribution")
        ax.set_ylabel("Count")
        plt.tight_layout()
        plt.show()
```

---

## 7. Time Series EDA

```python
def time_series_eda(df: pd.DataFrame, date_col: str, value_col: str,
                     freq: str = "D") -> None:
    """EDA for time series data: trend, seasonality, autocorrelation."""
    ts = df.set_index(date_col)[value_col].sort_index()

    fig, axes = plt.subplots(3, 1, figsize=(14, 10))

    # Raw series with rolling mean
    axes[0].plot(ts, alpha=0.5, label="Raw")
    rolling = ts.rolling(window=30, min_periods=1).mean()
    axes[0].plot(rolling, color="red", linewidth=2, label="30-period MA")
    axes[0].set_title(f"{value_col} — Time Series with Trend")
    axes[0].legend()

    # Seasonality (if enough data)
    if len(ts) > 60:
        # Simple: compute day-of-week or month-of-year averages
        if hasattr(ts.index, "dayofweek"):
            seasonal = ts.groupby(ts.index.dayofweek).mean()
            axes[1].bar(seasonal.index, seasonal.values, edgecolor="white")
            axes[1].set_title(f"{value_col} — Day-of-Week Seasonality")
            axes[1].set_xticks(range(7))
            axes[1].set_xticklabels(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])

    # Autocorrelation
    from pandas.plotting import autocorrelation_plot
    autocorrelation_plot(ts.dropna(), ax=axes[2])
    axes[2].set_title(f"{value_col} — Autocorrelation")
    axes[2].set_xlim(0, min(100, len(ts) // 2))

    plt.tight_layout()
    plt.show()

    # Stationarity test (ADF)
    from statsmodels.tsa.stattools import adfuller
    try:
        result = adfuller(ts.dropna())
        print(f"\nAugmented Dickey-Fuller Test:")
        print(f"  Statistic: {result[0]:.4f}")
        print(f"  p-value:   {result[1]:.4f}")
        print(f"  Stationary: {'Yes ✅' if result[1] < 0.05 else 'No ❌ — consider differencing'}")
    except Exception as e:
        print(f"  ADF test failed: {e} (install statsmodels: pip install statsmodels)")
```
