#!/usr/bin/env python3
"""Data Quality Audit Tool

Generates a comprehensive data quality report for any CSV file.
Outputs a console report and optionally a JSON file.

Usage:
    python data-audit.py <data.csv>
    python data-audit.py <data.csv> --json report.json

Requirements: pandas, numpy (standard DS stack)
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd


def audit_dataset(df: pd.DataFrame) -> dict:
    """Run a comprehensive data quality audit on a DataFrame."""

    report = {
        "overview": _overview(df),
        "missing_values": _missing_values(df),
        "duplicates": _duplicates(df),
        "cardinality": _cardinality(df),
        "type_analysis": _type_analysis(df),
        "outliers": _outliers(df),
        "statistics": _statistics(df),
    }
    return report


def _overview(df: pd.DataFrame) -> dict:
    mem_bytes = df.memory_usage(deep=True).sum()
    return {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "memory_bytes": int(mem_bytes),
        "memory_mb": round(mem_bytes / 1e6, 2),
        "dtypes": {str(k): int(v) for k, v in df.dtypes.value_counts().items()},
        "total_cells": int(df.shape[0] * df.shape[1]),
        "total_missing": int(df.isna().sum().sum()),
        "overall_completeness_pct": round(
            (1 - df.isna().sum().sum() / (df.shape[0] * df.shape[1])) * 100, 2
        ),
    }


def _missing_values(df: pd.DataFrame) -> list[dict]:
    results = []
    for col in df.columns:
        n_missing = int(df[col].isna().sum())
        n_total = len(df)
        pct = round(n_missing / n_total * 100, 2) if n_total > 0 else 0
        pattern = "none"
        if n_missing > 0:
            # Detect if missing values are concentrated at the start, end, or scattered
            missing_idx = df[col].isna()
            first_missing = int(missing_idx.idxmax()) if n_missing > 0 else -1
            last_missing = int(missing_idx[::-1].idxmax()) if n_missing > 0 else -1
            if n_missing == n_total:
                pattern = "all_missing"
            elif first_missing < n_total * 0.1 and last_missing < n_total * 0.1:
                pattern = "head_concentrated"
            elif first_missing > n_total * 0.9 and last_missing > n_total * 0.9:
                pattern = "tail_concentrated"
            else:
                pattern = "scattered"
        results.append({
            "column": col,
            "missing_count": n_missing,
            "missing_pct": pct,
            "pattern": pattern,
        })
    return sorted(results, key=lambda x: x["missing_pct"], reverse=True)


def _duplicates(df: pd.DataFrame) -> dict:
    n_dup = int(df.duplicated().sum())
    return {
        "duplicate_rows": n_dup,
        "duplicate_pct": round(n_dup / len(df) * 100, 2) if len(df) > 0 else 0,
        "unique_rows": int(len(df) - n_dup),
    }


def _cardinality(df: pd.DataFrame) -> list[dict]:
    results = []
    for col in df.columns:
        n_unique = int(df[col].nunique())
        n_total = len(df)
        ratio = round(n_unique / n_total, 4) if n_total > 0 else 0
        label = "constant" if n_unique <= 1 else (
            "binary" if n_unique == 2 else (
                "low" if n_unique <= 10 else (
                    "medium" if n_unique <= 100 else (
                        "high" if ratio < 0.5 else "unique-like"
                    )
                )
            )
        )
        results.append({
            "column": col,
            "unique_values": n_unique,
            "cardinality_ratio": ratio,
            "cardinality_label": label,
        })
    return results


def _type_analysis(df: pd.DataFrame) -> list[dict]:
    results = []
    for col in df.columns:
        inferred = str(df[col].dtype)
        suggestion = None
        issues = []

        if df[col].dtype == object:
            # Check if it could be numeric
            numeric_check = pd.to_numeric(df[col], errors="coerce")
            non_null = df[col].dropna()
            if len(non_null) > 0:
                numeric_pct = numeric_check.notna().sum() / len(non_null) * 100
                if numeric_pct > 90:
                    suggestion = "numeric (float64 or int64)"
                    issues.append(
                        f"{100 - numeric_pct:.1f}% non-numeric values blocking conversion"
                    )

            # Check if it could be datetime
            try:
                dt_check = pd.to_datetime(df[col], errors="coerce", infer_datetime_format=True)
                dt_pct = dt_check.notna().sum() / len(non_null) * 100 if len(non_null) > 0 else 0
                if dt_pct > 80 and suggestion is None:
                    suggestion = "datetime"
            except Exception:
                pass

            # Check if it could be boolean
            unique_lower = set(non_null.astype(str).str.lower().unique())
            if unique_lower <= {"true", "false", "yes", "no", "0", "1", "y", "n"}:
                suggestion = "boolean"

        elif pd.api.types.is_float_dtype(df[col]):
            # Check if float column is actually integer
            non_null = df[col].dropna()
            if len(non_null) > 0 and (non_null == non_null.astype(int)).all():
                suggestion = "integer (currently stored as float — possible due to NaN)"

        results.append({
            "column": col,
            "current_dtype": inferred,
            "suggested_dtype": suggestion,
            "issues": issues if issues else None,
        })
    return results


def _outliers(df: pd.DataFrame) -> list[dict]:
    results = []
    numeric_cols = df.select_dtypes(include="number").columns
    for col in numeric_cols:
        data = df[col].dropna()
        if len(data) < 4:
            continue
        q1 = float(data.quantile(0.25))
        q3 = float(data.quantile(0.75))
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        n_outliers = int(((data < lower) | (data > upper)).sum())
        results.append({
            "column": col,
            "q1": round(q1, 4),
            "q3": round(q3, 4),
            "iqr": round(iqr, 4),
            "lower_bound": round(lower, 4),
            "upper_bound": round(upper, 4),
            "outlier_count": n_outliers,
            "outlier_pct": round(n_outliers / len(data) * 100, 2),
        })
    return results


def _statistics(df: pd.DataFrame) -> list[dict]:
    results = []
    numeric_cols = df.select_dtypes(include="number").columns
    for col in numeric_cols:
        data = df[col].dropna()
        if len(data) == 0:
            continue
        results.append({
            "column": col,
            "count": int(data.count()),
            "mean": round(float(data.mean()), 4),
            "median": round(float(data.median()), 4),
            "std": round(float(data.std()), 4),
            "min": round(float(data.min()), 4),
            "max": round(float(data.max()), 4),
            "skewness": round(float(data.skew()), 4),
            "kurtosis": round(float(data.kurtosis()), 4),
            "p5": round(float(data.quantile(0.05)), 4),
            "p25": round(float(data.quantile(0.25)), 4),
            "p75": round(float(data.quantile(0.75)), 4),
            "p95": round(float(data.quantile(0.95)), 4),
        })
    return results


def print_report(report: dict) -> None:
    """Print a human-readable audit report to console."""
    ov = report["overview"]
    print("=" * 70)
    print("  DATA QUALITY AUDIT REPORT")
    print("=" * 70)

    # Overview
    print(f"\n📊 OVERVIEW")
    print(f"  Rows:         {ov['rows']:>12,}")
    print(f"  Columns:      {ov['columns']:>12}")
    print(f"  Memory:       {ov['memory_mb']:>12.2f} MB")
    print(f"  Completeness: {ov['overall_completeness_pct']:>11.1f}%")
    print(f"  Data types:   {ov['dtypes']}")

    # Missing values
    missing = [m for m in report["missing_values"] if m["missing_count"] > 0]
    print(f"\n🔍 MISSING VALUES ({len(missing)} columns with nulls)")
    if missing:
        print(f"  {'Column':<30} {'Count':>8} {'Pct':>8} {'Pattern':<20}")
        print(f"  {'-'*70}")
        for m in missing[:20]:
            flag = "⚠️" if m["missing_pct"] > 50 else "  "
            print(f"  {flag}{m['column']:<28} {m['missing_count']:>8,} {m['missing_pct']:>7.1f}% {m['pattern']:<20}")
        if len(missing) > 20:
            print(f"  ... and {len(missing) - 20} more columns")
    else:
        print("  ✅ No missing values found.")

    # Duplicates
    dup = report["duplicates"]
    print(f"\n📋 DUPLICATES")
    if dup["duplicate_rows"] > 0:
        print(f"  ⚠️  {dup['duplicate_rows']:,} duplicate rows ({dup['duplicate_pct']:.1f}%)")
    else:
        print(f"  ✅ No duplicate rows found.")

    # Cardinality flags
    print(f"\n🔢 CARDINALITY FLAGS")
    for c in report["cardinality"]:
        if c["cardinality_label"] in ("constant", "unique-like"):
            icon = "⚠️" if c["cardinality_label"] == "constant" else "🔑"
            print(f"  {icon} {c['column']:<30} {c['unique_values']:>8} unique  [{c['cardinality_label']}]")

    # Type suggestions
    suggestions = [t for t in report["type_analysis"] if t["suggested_dtype"]]
    if suggestions:
        print(f"\n🔄 TYPE SUGGESTIONS")
        for s in suggestions:
            print(f"  {s['column']:<30} {s['current_dtype']:<12} → {s['suggested_dtype']}")
            if s.get("issues"):
                for issue in s["issues"]:
                    print(f"     ℹ️  {issue}")

    # Outliers
    outliers = [o for o in report["outliers"] if o["outlier_count"] > 0]
    print(f"\n📐 OUTLIER FLAGS (IQR method, {len(outliers)} columns)")
    if outliers:
        print(f"  {'Column':<30} {'Count':>8} {'Pct':>8} {'Bounds'}")
        print(f"  {'-'*70}")
        for o in sorted(outliers, key=lambda x: x["outlier_pct"], reverse=True)[:15]:
            print(f"  {o['column']:<30} {o['outlier_count']:>8,} {o['outlier_pct']:>7.1f}% "
                  f"[{o['lower_bound']:.2f}, {o['upper_bound']:.2f}]")

    # Statistics summary
    stats = report["statistics"]
    if stats:
        print(f"\n📈 NUMERIC STATISTICS (top skewed)")
        skewed = sorted(stats, key=lambda x: abs(x["skewness"]), reverse=True)[:10]
        print(f"  {'Column':<25} {'Mean':>10} {'Median':>10} {'Std':>10} {'Skew':>8} {'Kurt':>8}")
        print(f"  {'-'*75}")
        for s in skewed:
            skew_flag = " ⚠️" if abs(s["skewness"]) > 2 else ""
            print(f"  {s['column']:<25} {s['mean']:>10.2f} {s['median']:>10.2f} "
                  f"{s['std']:>10.2f} {s['skewness']:>7.2f}{skew_flag} {s['kurtosis']:>7.2f}")

    print(f"\n{'=' * 70}")
    print("  Audit complete.")
    print(f"{'=' * 70}\n")


def main():
    parser = argparse.ArgumentParser(
        description="Data Quality Audit — generate a comprehensive report for a CSV file.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="Examples:\n"
               "  python data-audit.py customers.csv\n"
               "  python data-audit.py sales.csv --json audit_report.json\n"
               "  python data-audit.py data.csv --separator ';'\n",
    )
    parser.add_argument("file", help="Path to the CSV file to audit")
    parser.add_argument("--json", dest="json_out", help="Optional path to save JSON report")
    parser.add_argument("--separator", "-s", default=",", help="CSV separator (default: ',')")
    parser.add_argument("--sample", type=int, default=None,
                        help="Sample N rows for large files (audit on sample)")
    args = parser.parse_args()

    filepath = Path(args.file)
    if not filepath.exists():
        print(f"❌ Error: File not found: {filepath}")
        sys.exit(1)

    print(f"Loading {filepath.name}...")
    try:
        df = pd.read_csv(filepath, sep=args.separator, low_memory=False)
    except Exception as e:
        print(f"❌ Error reading CSV: {e}")
        sys.exit(1)

    if args.sample and args.sample < len(df):
        print(f"  Sampling {args.sample:,} rows from {len(df):,}...")
        df = df.sample(args.sample, random_state=42).reset_index(drop=True)

    print(f"  Loaded: {df.shape[0]:,} rows × {df.shape[1]} columns\n")

    report = audit_dataset(df)
    print_report(report)

    if args.json_out:
        json_path = Path(args.json_out)
        # Convert numpy types for JSON serialization
        def default_serializer(obj):
            if isinstance(obj, (np.integer,)):
                return int(obj)
            if isinstance(obj, (np.floating,)):
                return float(obj)
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

        with open(json_path, "w") as f:
            json.dump(report, f, indent=2, default=default_serializer)
        print(f"📄 JSON report saved to: {json_path}")


if __name__ == "__main__":
    main()
