#!/usr/bin/env python3
"""
Quantitative Research Code Validator
=====================================

Scans Python files for common anti-patterns in quantitative research code.
Uses only Python stdlib — no external dependencies required.

Usage:
    python validate.py <target_file.py>
    python validate.py <directory/>          # Scans all .py files recursively
    python validate.py <file.py> --strict    # Treat MEDIUM as failures too

Exit codes:
    0 — No CRITICAL or HIGH issues found
    1 — At least one CRITICAL or HIGH issue found
    2 — Usage error / file not found
"""

import ast
import re
import sys
import os
from dataclasses import dataclass, field
from typing import List, Optional
from pathlib import Path

# ──────────────────────────────────────────────────────────────
# Data structures
# ──────────────────────────────────────────────────────────────

@dataclass
class Finding:
    rule_id: str
    name: str
    severity: str  # CRITICAL, HIGH, MEDIUM
    line: int
    message: str
    suggestion: str


@dataclass
class ValidationReport:
    file: str
    findings: List[Finding] = field(default_factory=list)

    @property
    def critical_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == "CRITICAL")

    @property
    def high_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == "HIGH")

    @property
    def medium_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == "MEDIUM")


# ──────────────────────────────────────────────────────────────
# Detection rules
# ──────────────────────────────────────────────────────────────

HARDCODED_DATE_RE = re.compile(
    r'(start_date|end_date|begin_date|backtest_start|backtest_end|train_start|test_start)'
    r'\s*=\s*["\'](\d{4}-\d{2}-\d{2})["\']',
    re.IGNORECASE,
)

DATE_SLICE_RE = re.compile(
    r'\.loc\[\s*["\'](\d{4})[^"\']*["\']\s*:\s*["\'](\d{4})[^"\']*["\']\s*\]'
)

LOOKAHEAD_BFILL_RE = re.compile(r'\.(bfill|backfill)\s*\(')
LOOKAHEAD_FILLNA_RE = re.compile(r'fillna\s*\(.*method\s*=\s*["\'](bfill|backfill)["\']')
LOOKAHEAD_SHIFT_RE = re.compile(r'\.shift\s*\(\s*-\d+')

COST_KEYWORDS = {
    "transaction_cost", "commission", "spread", "slippage",
    "market_impact", "trading_cost", "bps", "basis_point",
    "cost_model", "tcost",
}

WALKFORWARD_KEYWORDS = {
    "walk_forward", "train_test_split", "cross_val", "rolling_window",
    "expanding_window", "out_of_sample", "oos", "holdout",
    "walk_forward_validate", "time_series_split",
}

RISK_KEYWORDS = {
    "max_position", "position_limit", "stop_loss", "max_drawdown",
    "risk_limit", "max_exposure", "var_limit", "leverage_limit",
    "risk_budget", "position_size",
}

STATIONARITY_KEYWORDS = {
    "adfuller", "kpss", "stationarity", "unit_root", "adf_test",
    "coint", "cointegration",
}

REGIME_KEYWORDS = {
    "regime", "hmm", "hidden_markov", "volatility_regime",
    "bull", "bear", "market_state", "regime_detect",
}

NULL_CHECK_KEYWORDS = {
    "dropna", "fillna", "isna", "isnull", "notna", "notnull",
}


def _file_has_keywords(content_lower: str, keywords: set) -> bool:
    """Check if file content contains any of the given keywords."""
    return any(kw in content_lower for kw in keywords)


def _is_backtest_file(content_lower: str) -> bool:
    """Heuristic: does this file look like it contains backtesting logic?"""
    backtest_signals = {"backtest", "strategy", "pnl", "sharpe", "returns", "signal"}
    return sum(1 for s in backtest_signals if s in content_lower) >= 2


def validate_file(filepath: str) -> ValidationReport:
    """Run all validation rules against a single Python file."""
    report = ValidationReport(file=filepath)

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            lines = content.split("\n")
    except (OSError, UnicodeDecodeError) as e:
        report.findings.append(Finding(
            rule_id="QV-ERR", name="File Read Error", severity="CRITICAL",
            line=0, message=str(e), suggestion="Fix file encoding or permissions",
        ))
        return report

    content_lower = content.lower()
    is_backtest = _is_backtest_file(content_lower)

    # ── QV-001: Hardcoded Backtest Dates ──
    for i, line in enumerate(lines, 1):
        for match in HARDCODED_DATE_RE.finditer(line):
            report.findings.append(Finding(
                rule_id="QV-001", name="Hardcoded Backtest Date",
                severity="CRITICAL", line=i,
                message=f"Hardcoded date found: {match.group(0)}",
                suggestion="Use parameterized config or relative date ranges",
            ))

    # ── QV-002: Missing Transaction Costs ──
    if is_backtest and not _file_has_keywords(content_lower, COST_KEYWORDS):
        report.findings.append(Finding(
            rule_id="QV-002", name="Missing Transaction Costs",
            severity="CRITICAL", line=0,
            message="Backtesting logic detected but no transaction cost modeling found",
            suggestion="Add commission + spread + market impact cost model",
        ))

    # ── QV-003: No Walk-Forward Split ──
    if is_backtest and not _file_has_keywords(content_lower, WALKFORWARD_KEYWORDS):
        report.findings.append(Finding(
            rule_id="QV-003", name="No Walk-Forward Split",
            severity="CRITICAL", line=0,
            message="Backtesting logic without walk-forward or train/test split",
            suggestion="Implement walk-forward validation with embargo gap",
        ))

    # ── QV-006: Look-Ahead Indicators ──
    for i, line in enumerate(lines, 1):
        if LOOKAHEAD_BFILL_RE.search(line) or LOOKAHEAD_FILLNA_RE.search(line):
            report.findings.append(Finding(
                rule_id="QV-006", name="Look-Ahead Bias (bfill)",
                severity="CRITICAL", line=i,
                message="Backward fill detected — uses future values to fill past NaNs",
                suggestion="Replace bfill() with ffill() or explicit forward-fill logic",
            ))
        if LOOKAHEAD_SHIFT_RE.search(line):
            report.findings.append(Finding(
                rule_id="QV-006", name="Look-Ahead Bias (negative shift)",
                severity="CRITICAL", line=i,
                message="Negative shift detected — accessing future data rows",
                suggestion="Use positive shift for lagged features, or explicitly label as target variable",
            ))

    # ── QV-005: No Stationarity Check ──
    if is_backtest and not _file_has_keywords(content_lower, STATIONARITY_KEYWORDS):
        if any(kw in content_lower for kw in {"regression", "corr", "mean_revert", "cointegrat"}):
            report.findings.append(Finding(
                rule_id="QV-005", name="No Stationarity Check",
                severity="HIGH", line=0,
                message="Statistical analysis without stationarity testing (ADF/KPSS)",
                suggestion="Run adfuller() or kpss() on input series before analysis",
            ))

    # ── QV-007: Missing Risk Limits ──
    if is_backtest and not _file_has_keywords(content_lower, RISK_KEYWORDS):
        report.findings.append(Finding(
            rule_id="QV-007", name="Missing Risk Limits",
            severity="HIGH", line=0,
            message="Strategy code without risk limits (position size, stop loss, max drawdown)",
            suggestion="Add max_position, stop_loss, and max_drawdown checks",
        ))

    # ── QV-009: No Regime Awareness ──
    if is_backtest and not _file_has_keywords(content_lower, REGIME_KEYWORDS):
        report.findings.append(Finding(
            rule_id="QV-009", name="No Regime Awareness",
            severity="MEDIUM", line=0,
            message="No regime detection or classification found in strategy code",
            suggestion="Implement regime detection (HMM, volatility regimes) and adapt strategy per regime",
        ))

    # ── QV-010: Missing Null Checks ──
    if any(kw in content_lower for kw in {"read_csv", "read_parquet", "dataframe", "api"}):
        if not _file_has_keywords(content_lower, NULL_CHECK_KEYWORDS):
            report.findings.append(Finding(
                rule_id="QV-010", name="Missing Null Checks",
                severity="HIGH", line=0,
                message="Data loading without null/NaN handling",
                suggestion="Add dropna(), fillna(), or explicit null assertions after data load",
            ))

    # ── QV-008: Single-Period Backtest ──
    date_slices = DATE_SLICE_RE.findall(content)
    for start_year, end_year in date_slices:
        span = int(end_year) - int(start_year)
        if span < 5:
            report.findings.append(Finding(
                rule_id="QV-008", name="Single-Period Backtest",
                severity="MEDIUM", line=0,
                message=f"Backtest spans only {span} years ({start_year}-{end_year}). Minimum 5+ years recommended",
                suggestion="Test across multiple market regimes (include 2008, 2020, 2022)",
            ))

    return report


# ──────────────────────────────────────────────────────────────
# Output formatting
# ──────────────────────────────────────────────────────────────

SEVERITY_ICONS = {"CRITICAL": "🔴", "HIGH": "🟡", "MEDIUM": "🟠"}


def print_report(report: ValidationReport) -> None:
    """Print a formatted validation report to stdout."""
    print(f"\n{'='*60}")
    print(f"  Quant Validation Report: {os.path.basename(report.file)}")
    print(f"{'='*60}")

    if not report.findings:
        print("\n  ✅ No issues found. (This does not mean the strategy works.)\n")
        return

    for finding in sorted(report.findings, key=lambda f: {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2}[f.severity]):
        icon = SEVERITY_ICONS[finding.severity]
        loc = f"L{finding.line}" if finding.line > 0 else "global"
        print(f"\n  {icon} [{finding.rule_id}] {finding.name} ({finding.severity}) @ {loc}")
        print(f"     {finding.message}")
        print(f"     → {finding.suggestion}")

    print(f"\n{'─'*60}")
    print(f"  Summary: {report.critical_count} CRITICAL | {report.high_count} HIGH | {report.medium_count} MEDIUM")
    if report.critical_count > 0:
        print("  ❌ FAIL — resolve CRITICAL issues before proceeding")
    elif report.high_count > 0:
        print("  ⚠️  WARN — resolve HIGH issues before live deployment")
    else:
        print("  ✅ PASS — only advisory issues found")
    print(f"{'='*60}\n")


# ──────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────

def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python validate.py <file.py|directory/> [--strict]")
        return 2

    target = sys.argv[1]
    strict = "--strict" in sys.argv

    # Collect files to scan
    files: List[str] = []
    if os.path.isfile(target):
        files = [target]
    elif os.path.isdir(target):
        for root, _, filenames in os.walk(target):
            for fn in filenames:
                if fn.endswith(".py"):
                    files.append(os.path.join(root, fn))
    else:
        print(f"Error: '{target}' is not a file or directory")
        return 2

    if not files:
        print(f"No Python files found in '{target}'")
        return 2

    total_critical = 0
    total_high = 0
    total_medium = 0

    for filepath in sorted(files):
        report = validate_file(filepath)
        print_report(report)
        total_critical += report.critical_count
        total_high += report.high_count
        total_medium += report.medium_count

    # Final summary for multi-file runs
    if len(files) > 1:
        print(f"\n{'='*60}")
        print(f"  TOTAL: {len(files)} files scanned")
        print(f"  {total_critical} CRITICAL | {total_high} HIGH | {total_medium} MEDIUM")
        print(f"{'='*60}\n")

    if total_critical > 0 or total_high > 0:
        return 1
    if strict and total_medium > 0:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
