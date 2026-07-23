# Change Analysis Methodology

## When to Use

Change Analysis is the **fastest path to root cause** when an incident timing strongly correlates with a known change event. It is run as a **parallel track** alongside the primary RCA method (5 Whys, Fishbone, or Apollo RCA).

**Triggers for Change Analysis:**

- Incident began shortly after a deployment
- Error rate inflection aligns with a config change
- New behavior appeared after a library/dependency update
- DB migration or Secrets Manager rotation preceded the issue
- Feature flag toggled and anomalies followed

## Process

### Step 1: Define the Problem

- What is the observed failure/anomaly?
- When exactly did symptoms begin? (timestamp with second precision)
- What is the measured impact? (error rate, latency increase, affected users)

### Step 2: Identify the Change Event

Catalog ALL changes in the window from 72h before symptom onset to symptom onset:

| Change Type | Source | Example |
|-------------|--------|---------|
| Code deploy | ECS service update, CI/CD pipeline | `payment-service v2.47.3` |
| Config change | AWS Parameter Store, env vars | `connection_pool_size: 10 → 100` |
| Secrets rotation | AWS Secrets Manager | `pas-admission` secret rotated |
| DB migration | Migration scripts, schema changes | `ALTER TABLE ADD COLUMN` |
| Feature flag | LaunchDarkly, config service | `new-checkout-flow: enabled` |
| Library update | package.json, requirements.txt | `stripe-sdk 3.0 → 4.0` |
| Infrastructure | ECS task definition, ALB config | `Memory: 512MB → 256MB` |
| Traffic pattern | External events, marketing campaign | Black Friday traffic spike |
| Dependency change | 3rd party API, middleware | CNDS payload format change |

### Step 3: Compare Before vs After

For the suspected change, compare these dimensions:

| Dimension | Before Change | After Change | Delta |
|-----------|--------------|-------------|-------|
| Error rate | 0.1% | 12.5% | +12.4% |
| P99 latency | 200ms | 2300ms | +2100ms |
| DB connections | 45/100 | 100/100 | Pool exhausted |
| CPU utilization | 30% | 85% | +55% |
| Memory usage | 60% | 95% | +35% |
| Request volume | 1000/min | 1050/min | +5% (not causal) |

### Step 4: Establish Causality (Not Just Correlation)

**Strong evidence of causality:**

- Rollback of change resolves the incident
- Reproduction in staging with same change
- Mechanism is explainable (e.g., "new code path leaks DB connections")

**Weak evidence (coincidence):**

- Traffic volume didn't change
- Change is in unrelated service
- Timing correlation is >1 hour

### Step 5: Validate with Rollback or Staging

**Gold standard:** Rollback the suspected change and verify incident resolves.

**Alternative:** Reproduce the issue in staging by applying the same change.

**Last resort:** If rollback is not possible, verify the mechanism by code review or dry-run analysis.

## Temporal Scoring Heuristic

When multiple changes occurred, score each by temporal proximity:

```
Score = f(time_delta, change_scope, failure_type)

time_delta = symptom_onset - change_timestamp

if time_delta < 5min:   score = 0.9-1.0  (highly suspicious)
if time_delta < 1h:     score = 0.6-0.8  (likely related)
if time_delta < 24h:    score = 0.3-0.5  (possible)
if time_delta > 72h:    score = 0.1-0.2  (unlikely direct cause)
```

Adjust by change scope: infrastructure changes affect all traffic (higher weight), code changes affect only new code paths (moderate weight), feature flags affect specific users (context-dependent).

## Common Pitfalls

1. **Confirmation bias:** Don't stop at the first correlating change — check ALL changes in the window
2. **Latent bugs:** A change may expose a pre-existing bug that only triggers under new conditions
3. **Multiple contributing changes:** Sometimes 2-3 changes combine to cause the incident — each alone is benign
4. **Traffic-dependent:** Some changes only fail under specific load patterns or request types
