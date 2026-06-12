# Stakeholder Communication — Reference

Templates and frameworks for translating data science results into business decisions.

---

## 1. Executive Summary Template (1-Pager)

Use this for any project milestone, final report, or decision request.

```markdown
# [Project Name] — Executive Summary
**Date:** [YYYY-MM-DD]  |  **Author:** [Name]  |  **For:** [Stakeholder Name/Title]

## Problem
[1-2 sentences. What business problem are we solving? Why does it matter?
Include a dollar figure, metric, or customer impact if available.]

## Approach
[1-2 sentences. What did we do? Use plain language — no jargon.
"We analyzed 18 months of customer behavior data to predict which customers
are likely to cancel their subscription within the next 30 days."]

## Key Results
- **Finding 1:** [Business-language result with number]
  (e.g., "The model identifies 76% of churning customers 30 days in advance")
- **Finding 2:** [Supporting result]
  (e.g., "Customers with declining usage in weeks 2-4 are 5× more likely to churn")
- **Confidence:** [How confident are we? What's the uncertainty?]
  (e.g., "Tested on 3 months of held-out data; results are stable across segments")

## Recommendation
[1-2 sentences. What should we do? Be specific and actionable.]
(e.g., "Deploy the model to trigger proactive outreach to high-risk customers.
Expected impact: retain 15% of at-risk accounts = $2.1M ARR saved.")

## Next Steps
1. [Action item] — Owner: [name] — By: [date]
2. [Action item] — Owner: [name] — By: [date]
3. [Action item] — Owner: [name] — By: [date]

## Appendix (for those who want detail)
- Model: [type, key hyperparameters]
- Data: [source, date range, sample size]
- Metrics: [precision, recall, AUC — with definitions]
```

**Rules:**
- The exec summary should fit on **one printed page** (300-400 words)
- Lead with the **business outcome**, not the technique
- Numbers > adjectives: "reduces churn by 15%" beats "significantly improves retention"
- Include uncertainty: "±3pp based on 95% CI" — stakeholders respect honesty

---

## 2. Technical Report Template (Peer Review)

For sharing with other data scientists, ML engineers, or technical reviewers.

```markdown
# [Project Name] — Technical Report
**Version:** [x.y]  |  **Date:** [date]  |  **Author:** [name]

## 1. Problem Definition
- Business context and objective
- Data mining goal (classification / regression / clustering / etc.)
- Success criteria (business + technical)

## 2. Data
- Sources, schemas, date ranges, access
- Data quality summary (missing %, outliers, known issues)
- Feature list with definitions (link to data dictionary)
- Train/val/test split methodology and rationale

## 3. Methodology
- Baseline definition
- Feature engineering (with rationale for each transform)
- Model selection process (why this algorithm?)
- Hyperparameter tuning (search space, method, best params)
- Cross-validation strategy

## 4. Results
- Full metric table (vs baseline, vs prior version)
- Confusion matrix / residual plots
- Error analysis (where does the model fail?)
- Fairness audit (performance across segments)

## 5. Limitations & Risks
- Known failure modes
- Data drift concerns
- Assumptions that could break

## 6. Deployment Plan
- Serving infrastructure
- Monitoring setup
- Retraining schedule

## 7. Appendix
- Experiment log (all runs, not just the best)
- Feature importance rankings
- Detailed EDA plots
```

---

## 3. Dashboard Design Principles

### Tufte's Data-Ink Ratio

**Data-Ink Ratio = (ink used to represent data) / (total ink on the chart)**

Maximize this ratio by removing:
- Gridlines (or make them very faint)
- Borders and boxes around charts
- 3D effects (never use 3D)
- Decorative elements
- Redundant labels
- Background colors (use white)

### Pre-Attentive Attributes

The human visual system processes these attributes **in <200ms**, before conscious attention:

| Attribute | Use for | Example |
| --- | --- | --- |
| **Color hue** | Categories, status | Red/green for alert/ok (use colorblind-safe alternatives) |
| **Color intensity** | Magnitude | Darker = higher value |
| **Size** | Magnitude comparison | Bubble charts, proportional symbols |
| **Position** | Precise comparison | Bar height, dot position on axis |
| **Orientation** | Direction, trend | Slope of lines |

**Rule of thumb:** Use position for precise comparison (bar charts), color for category, and size sparingly.

### Dashboard Layout

```
┌────────────────────────────────────────────────────┐
│  TITLE — What question does this dashboard answer? │
├──────────────┬──────────────┬──────────────────────┤
│  KPI Card 1  │  KPI Card 2  │  KPI Card 3         │
│  [big number]│  [big number]│  [big number]        │
│  [vs target] │  [trend ↑↓]  │  [vs prior period]   │
├──────────────┴──────────────┴──────────────────────┤
│  PRIMARY CHART — The one chart that tells the story│
│  [Line/bar chart with clear labels, one message]   │
├────────────────────────┬───────────────────────────┤
│  SUPPORTING CHART 1    │  SUPPORTING CHART 2       │
│  [Breakdown/segment]   │  [Trend/comparison]       │
├────────────────────────┴───────────────────────────┤
│  FILTERS: Date range | Segment | Region            │
└────────────────────────────────────────────────────┘
```

---

## 4. Visualization Selection Guide

| Data Relationship | Chart Type | When to Use |
| --- | --- | --- |
| **Comparison** (categories) | Bar chart (horizontal) | Comparing values across categories; always horizontal if labels are long |
| **Comparison** (few items) | Bar chart (vertical) | ≤7 categories, short labels |
| **Trend** (over time) | Line chart | Continuous time series; ≥7 time points |
| **Trend** (few periods) | Bar chart | Discrete time periods (Q1/Q2/Q3/Q4) |
| **Part-to-whole** | Stacked bar, 100% bar | How segments contribute to total; avoid pie charts |
| **Distribution** | Histogram, box plot | Understanding spread, skew, outliers |
| **Correlation** | Scatter plot | Relationship between two continuous variables |
| **Composition** (2 dims) | Heatmap | Matrix data, confusion matrices, correlation matrices |
| **Geospatial** | Choropleth map | Regional comparison where geography matters |
| **Flow / process** | Sankey diagram | User journeys, funnel analysis |

### Charts to Avoid

| Chart | Problem | Use Instead |
| --- | --- | --- |
| **Pie chart** | Hard to compare angles; useless with >5 slices | Horizontal bar chart |
| **3D anything** | Distorts perception, adds no information | 2D equivalent |
| **Dual Y-axis** | Misleading — scales manipulate visual correlation | Two separate charts |
| **Truncated Y-axis** | Exaggerates small differences | Start Y at 0 (or clearly label the break) |
| **Stacked area** | Hard to read non-baseline layers | Small multiples |

---

## 5. Common Communication Mistakes

### 1. Leading with the Method
❌ "We trained an XGBoost model with 150 trees and max_depth=6 using 5-fold stratified CV."
✅ "We built a model that catches 76% of churning customers 30 days before they leave."

### 2. Correlation ≠ Causation Claims
❌ "Users who complete onboarding have 3× higher retention, so onboarding causes retention."
✅ "Users who complete onboarding have 3× higher retention. This is correlational — motivated users may both complete onboarding and retain. An A/B test would confirm causality."

### 3. Presenting All Results Instead of the Insight
❌ 15 charts, 8 tables, 3 pages of model comparison.
✅ One chart that answers the question. Details in appendix.

### 4. No Recommendation
❌ "Here are the results." [end of presentation]
✅ "Based on these results, we recommend deploying variant B. Here's the expected impact and rollback plan."

### 5. Ignoring Uncertainty
❌ "The model has 85% accuracy."
✅ "The model has 85% accuracy (95% CI: 82-88%), tested on 3 months of held-out data across all segments."

---

## 6. Storytelling with Data Framework

Based on Knaflic (2015) — the **Context → What → So-What → Now-What** arc:

| Stage | Question to Answer | Example |
| --- | --- | --- |
| **Context** | What's the background? Who's the audience? What do they care about? | "The exec team is concerned about rising churn in the enterprise segment." |
| **What** | What did we find? (Just the facts, clearly visualized.) | "Enterprise churn rose from 4% to 7% over Q1-Q3, driven by accounts with <3 active users." |
| **So What** | Why does this matter? What's the implication? | "At current trajectory, we lose $4.2M ARR by Q2 next year. Low-usage accounts are the leading indicator." |
| **Now What** | What should we do about it? (The recommendation.) | "Deploy the early-warning model to flag at-risk accounts. Assign CSMs proactively. Expected save: 40% of at-risk ARR." |

**Narrative structure:**
1. Open with the **tension** (the problem, the gap, the risk)
2. Build with **evidence** (the data, clearly visualized)
3. Resolve with **the recommendation** (what to do, with confidence)
4. Close with **next steps** (who does what by when)

Every presentation should leave the audience knowing **exactly what to do next**.
