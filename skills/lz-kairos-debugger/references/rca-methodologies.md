# RCA Methodologies — Selection Guide

## Adaptive RCA Framework

No single method works for all incidents. Use this decision tree:

```
Incident Reported
    │
    ├─ Is the cause obvious and linear? → 5 Whys
    │
    ├─ Multiple possible cause branches? → Fishbone Diagram
    │
    ├─ Evidence conflicts between causes? → Apollo RCA (RealityCharting)
    │
    ├─ Deploy/change timing correlates? → Change Analysis (run in parallel)
    │
    ├─ Cascading failure across services? → Fault Tree Analysis
    │
    └─ High-stakes/safety-critical? → Full Apollo + FMEA
```

## Method Comparison

| Method | Depth | Speed | Multi-Factor | Evidence-Based | Best For |
|--------|:-----:|:-----:|:------------:|:--------------:|----------|
| 5 Whys | Shallow | ⚡ Fast | ❌ | ⚠️ Partial | Linear, single-team issues |
| 5+ Whys (PRIZ) | Medium | ⚡ Fast | ⚠️ Limited | ⚠️ Partial | Extended chains (8-10 levels) |
| Fishbone (Ishikawa) | Medium | 🔵 Medium | ✅ | ❌ Brainstorm | Brainstorming categories |
| Change Analysis | Medium | ⚡ Fast | ⚠️ Partial | ✅ | Deploy-correlated incidents |
| Apollo RCA | Deep | 🐢 Slow | ✅ | ✅ Full | Complex multi-factor failures |
| Fault Tree Analysis | Deep | 🐢 Slow | ✅ | ✅ | Safety-critical, cascading |
| FMEA | Deep | 🐢 Slow | ✅ | ✅ Proactive | Pre-deploy risk assessment |

## Method 1: 5 Whys (Adaptive Depth)

**Core principle:** Ask "why?" repeatedly, but don't stop at exactly 5. Stop when:

- You reach a cause you can influence and fix
- Further whys add no useful leverage
- You hit a boundary (3rd party, infrastructure you don't control)

**Rules:**

1. Each "why" must be validated with objective evidence (log, metric, config)
2. If a "why" branches into multiple plausible causes → STOP, switch to Fishbone
3. Replace "person-language" with "system-language" (blameless)

**Example:**

```
Why #1: /pay/checkout timeout → DB connection pool exhausted
Why #2: Pool exhausted → connections not released after errors
Why #3: Not released → db.release() in catch block skipped by early return
Why #4: Early return → signature validation throws before cleanup
Why #5: Signature throws → 3rd party changed payload casing without notice
```

**Stop condition:** Root cause is external (3rd party change) — actionable fix is to add defensive casing normalization.

### Parallel 5-Whys for Microservices

When multiple services are affected, run a **parallel 5-whys per service** and merge at level 5 to find shared root causes:

```
Service A: 5-Whys → missing circuit breaker
Service B: 5-Whys → missing circuit breaker
Service C: 5-Whys → missing circuit breaker
         ↓ MERGE
Shared root cause: No resilience pattern applied at shared dependency
```

This technique is critical for payment systems where a single upstream failure cascades across HIS → PAS → PAY. The individual service RCAs may each surface different symptoms (timeout, connection leak, signature mismatch) but converge on the same systemic deficiency.

## Method 2: Fishbone (Ishikawa) Diagram

**When to use:** Multiple possible cause categories, brainstorming needed.

**Categories for software incidents:**

- **People:** Knowledge gaps, training, communication
- **Process:** Deploy procedures, review gates, monitoring gaps
- **Technology:** Code bugs, config errors, capacity limits
- **Infrastructure:** Network, DB, cloud service issues
- **Measurement:** Alerting gaps, metric blind spots, log gaps
- **External:** 3rd party APIs, traffic patterns, dependency changes

**Process:**

1. Place the problem at the "head" of the fish
2. Brainstorm causes in each category
3. For each cause, ask "why?" to add sub-causes
4. Identify which causes have evidence vs which are hypotheses

## Method 3: Apollo RCA (RealityCharting)

**The gold standard for complex multi-factor failures.**

**Core principle:** Every effect requires AT LEAST TWO causes — one ACTION and one CONDITION. This dual-requirement prevents premature single-cause conclusions.

**Four Stages:**

### Stage 1: Define the Problem

- What happened? (specific event, not general category)
- When did it happen? (precise timestamps)
- Where did it happen? (specific service, endpoint, region)
- What was the impact? (users affected, revenue impact, duration)

### Stage 2: Determine Cause-Effect Relationships

Build a RealityChart:

- Start with the problem (effect)
- Ask "what caused this?" — answer must include BOTH an action AND a condition
- For each cause, ask "what caused this?" (same rule: action + condition)
- Continue until you reach causes that are outside your control or fully explain the event

**Action vs Condition example:**

```
Effect: Fire started
  ← Match was struck (ACTION) AND Oxygen was present (CONDITION)
    ← Person lit match (ACTION) AND Match was available (CONDITION)
      ← Storage protocol followed (CONDITION) AND Person needed light (ACTION)
```

### Stage 3: Identify Effective Solutions

- Challenge each cause: "Can we eliminate or control this?"
- Solutions must be: within control, prevent recurrence, meet organizational goals
- Each solution links back to a specific cause in the chart

### Stage 4: Implement and Track

- Assign owners and deadlines
- Track in project management tool
- Verify effectiveness after implementation

## Method 4: Change Analysis

**When to use:** Incident timing strongly correlates with a known change.

**Questions to answer:**

1. What changed? (code deploy, config edit, DB migration, feature flag, library update, traffic pattern)
2. When exactly did the change occur vs when symptoms began?
3. What was the system state BEFORE the change?
4. What is the system state AFTER the change?
5. Is the correlation causal or coincidental? (validate with rollback test or staging reproduction)

**Temporal scoring heuristic:**

- Change within 5 minutes of symptom onset → highly suspicious (score 0.9+)
- Change within 1 hour → likely related (score 0.6-0.8)
- Change within 24 hours → possible (score 0.3-0.5)
- Change more than 72 hours prior → unlikely as direct cause

## Method 5: Fault Tree Analysis (FTA)

**When to use:** Cascading failures, safety-critical systems, multiple failure paths.

**Structure:**

```
Top Event: [System Failure]
    AND Gate:
        [Condition A] must occur
        AND [Condition B] must occur
    OR Gate:
        [Cause X] could trigger
        OR [Cause Y] could trigger
```

Use AND/OR logic gates to model how multiple smaller failures combine into major system failures. Effective for identifying single points of failure and calculating failure probability when rates are known.
