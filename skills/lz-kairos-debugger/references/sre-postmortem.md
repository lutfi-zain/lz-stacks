# SRE Blameless Postmortem & Timeline Construction

## Blameless Principles

A blameless postmortem focuses on **systems and processes**, not individuals.

| Blame-Shaped (Avoid) | System-Shaped (Use) |
|----------------------|---------------------|
| "Engineer X deployed a buggy change" | "The CI/CD pipeline did not catch the bug before production" |
| "The on-call was slow to respond" | "Alert noise caused fatigue, delaying triage of a critical signal" |
| "The team missed a warning sign" | "Warning signs were not documented in runbooks, making them easy to miss" |

**Core rule:** Everyone involved in an incident had good intentions and did the right thing with the information they had. Focus on: "What about our system allowed this to happen?"

## Timeline Construction

### Data Sources for Timeline

| Source | What It Provides | How to Access |
|--------|-----------------|---------------|
| CloudWatch Logs | Application-level events, errors, traces | `aws logs filter-log-events` |
| ECS Events | Task lifecycle, deployments, scaling | EventBridge → CloudWatch Logs |
| CloudTrail | API calls (who changed what) | `aws cloudtrail lookup-events` |
| CI/CD Pipeline | Deploy timestamps, commit hashes | Jenkins/GitHub Actions/CodePipeline |
| Chat/Slack | Communication timeline, decisions | Manual extraction |
| ALB Access Logs | Request-level latency, error codes | S3 → Athena query |

### Timeline Template

```
## Incident Timeline

### Pre-Incident (Context)
- [YYYY-MM-DD HH:MM:SS] — [Event] (e.g., deploy of service X v2.1.0)
- [YYYY-MM-DD HH:MM:SS] — [Event] (e.g., DB migration completed)

### Detection
- [YYYY-MM-DD HH:MM:SS] — First alert fires (CloudWatch alarm: error_rate > 5%)
- [YYYY-MM-DD HH:MM:SS] — On-call engineer acknowledged alert
- [YYYY-MM-DD HH:MM:SS] — Incident declared, IC assigned

### Investigation
- [YYYY-MM-DD HH:MM:SS] — Initial triage: identified affected service
- [YYYY-MM-DD HH:MM:SS] — Log analysis: found error pattern
- [YYYY-MM-DD HH:MM:SS] — Cross-service trace: identified failure propagation

### Mitigation
- [YYYY-MM-DD HH:MM:SS] — Decision: rollback / fix-forward / feature flag disable
- [YYYY-MM-DD HH:MM:SS] — Mitigation applied
- [YYYY-MM-DD HH:MM:SS] — Error rate returned to baseline

### Recovery
- [YYYY-MM-DD HH:MM:SS] — Verified all affected users recovered
- [YYYY-MM-DD HH:MM:SS] — Monitoring confirmed stability (N minutes clean)
- [YYYY-MM-DD HH:MM:SS] — Incident resolved

### Post-Incident
- [YYYY-MM-DD HH:MM:SS] — Postmortem scheduled
- [YYYY-MM-DD HH:MM:SS] — Action items assigned
```

## Key Metrics to Track

| Metric | Definition | Target |
|--------|-----------|--------|
| **MTTD** (Mean Time to Detect) | Time from incident start to first alert | < 5 min |
| **MTTA** (Mean Time to Acknowledge) | Time from alert to engineer acknowledgment | < 10 min |
| **MTTM** (Mean Time to Mitigate) | Time from acknowledgment to mitigation applied | < 30 min |
| **MTTR** (Mean Time to Resolve) | Time from incident start to full resolution | < 2 hours |

## Postmortem Meeting Agenda (30 min)

1. **Context setting** (3 min) — Read blameless notice aloud
2. **Timeline walkthrough** (7 min) — Author presents key events (facts only)
3. **Root cause discussion** (10 min) — Review RCA chain (5 Whys / Apollo / etc.)
4. **What went well** (3 min) — Acknowledge successes, including "where we got lucky"
5. **Action item review** (5 min) — Verify owners and due dates
6. **Closing** (2 min) — Confirm tracking, schedule follow-up

## Quality Checklist

### Completeness

- [ ] All metadata fields populated (severity, affected services, duration)
- [ ] Timeline has timestamps for key events
- [ ] Root cause goes beyond surface explanation
- [ ] Impact is quantified (users, revenue, duration)

### Blamelessness

- [ ] No individual blame language
- [ ] Focus on systems, processes, and tooling

### Actionability

- [ ] Every action item has an owner
- [ ] Every action item has a due date
- [ ] Actions are specific and measurable

### Distribution

- [ ] Shared with relevant teams within 24h
- [ ] Added to postmortem index/repository
- [ ] Action items tracked in project management tool
