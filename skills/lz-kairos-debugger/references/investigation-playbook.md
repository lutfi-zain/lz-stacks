# AWS ECS & Kairos Investigation Playbook

Technical guide for executing forensic operations on Kairos AWS ECS infrastructure.

## 1. CloudWatch Log Extraction

### Primary: filter-log-events (when Insights blocked)

```bash
# Basic extraction with pagination
aws logs filter-log-events \
  --log-group-name "/ecs/kairos-pas-cluster-ecs-iac" \
  --filter-pattern '{ $.level = "ERROR" }' \
  --start-time <epoch_ms> --end-time <epoch_ms> \
  --interleaved --max-items 1000 \
  --profile kairos-production --region ap-southeast-3
```

**Pagination pattern:**

```bash
# Extract all pages
NEXT_TOKEN=""
while true; do
  RESULT=$(aws logs filter-log-events \
    --log-group-name "<log-group>" \
    --filter-pattern '<pattern>' \
    --start-time <start> --end-time <end> \
    --interleaved --max-items 1000 \
    ${NEXT_TOKEN:+--next-token "$NEXT_TOKEN"} \
    --profile <profile> --region ap-southeast-3)
  
  echo "$RESULT" >> raw_logs.json
  
  NEXT_TOKEN=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('nextToken',''))" 2>/dev/null)
  [ -z "$NEXT_TOKEN" ] && break
done
```

**Aggregation script pattern:**

```python
import json
from collections import Counter
from datetime import datetime

errors = []
with open('raw_logs.json') as f:
    for line in f:
        data = json.loads(line)
        for event in data.get('events', []):
            ts = datetime.fromtimestamp(event['timestamp'] / 1000)
            msg = event.get('message', '')
            if 'ERROR' in msg:
                errors.append({'time': ts, 'message': msg})

# Error rate per minute
minute_counts = Counter(e['time'].strftime('%H:%M') for e in errors)
for minute, count in sorted(minute_counts.items()):
    print(f"{minute}: {count} errors")
```

### Secondary: CloudWatch Logs Insights

```sql
-- Error rate by service (last 1h)
fields @timestamp, @message
| filter @message like /ERROR/
| stats count(*) as error_count by bin(1m) as time_bucket
| sort time_bucket asc
```

```sql
-- Request trace by ID
fields @timestamp, @message
| filter @message like /trace-id-abc-123/
| sort @timestamp asc
```

### Tertiary: CloudWatch Investigations (AI-Powered)

CloudWatch Investigations auto-discovers resource topology and generates hypotheses:

1. Navigate to CloudWatch → Investigations
2. Select the alarm or metric that triggered
3. Review AI-generated observations and hypotheses
4. Accept hypotheses to generate incident reports

## 2. ECS Container Constraints

### HIS Containers — No SSM

Container HIS (`his-*-iac`) **do NOT** have SSM agent. `aws ecs execute-command` fails with `TargetNotConnectedException`.

**Workaround:** Always rely on:

- CloudWatch logs (primary)
- Local/VPN cURL to internal ALB/IP target
- Secrets Manager values (runtime config)

### Other Containers — execute-command

```bash
# For non-HIS containers only
aws ecs execute-command \
  --cluster <cluster-name> \
  --task <task-id> \
  --container <container-name> \
  --interactive \
  --command "/bin/sh" \
  --profile <profile> --region ap-southeast-3
```

## 3. Configuration & Secrets Gotcha

### NEVER Assume Code Defaults

Kairos loads config from **AWS Secrets Manager** at runtime via `SecretStorage.syncSecret()`. Task Definition may show `environment: []` and `secrets: []` while actual config comes from Secrets Manager.

```bash
# Verify actual runtime values
aws secretsmanager get-secret-value \
  --secret-id <secret-name> \
  --profile <profile> --region ap-southeast-3 \
  --query 'SecretString' --output text | python3 -m json.tool
```

**Commonly checked secrets:**

- `pas-admission` — PAS pool size, timeouts
- `pay-payment` — Payment gateway credentials
- `his-auth` — Authentication config
- `cnds-gateway` — Gateway routing config

## 4. Middleware & Signature Tracing

### CNDS Signature Validation

When signature validation fails across services:

1. **Check C# computed value** in CloudWatch:

   ```bash
   aws logs filter-log-events \
     --log-group-name "/ecs/kairos-pas-cluster-ecs-iac" \
     --filter-pattern 'LOG>>' \
     --start-time <start> --end-time <end> \
     --profile <profile>
   ```

2. **Compare with JS computation** in frontend code

3. **Common mismatch patterns:**
   - Leading zero: `0E78E...` (C#) vs `E78E...` (JS)
   - Casing: `SHA256` vs `sha256`
   - Encoding: UTF-8 vs ASCII in payload hashing

### UAT vs Local Proxy

Local proxy (`npm run uat`) routes to port 5158 which may have different CNDS middleware behavior than UAT-direct. Always test both:

- **UAT-direct:** Agent browser → ALB → backend
- **Local proxy:** localhost:5158 → proxy → backend

## 5. ECS Lifecycle Events

### Event Types

| Event Type | Description | Use Case |
|------------|-------------|----------|
| Task state changes | Lifecycle events for ECS tasks | Troubleshoot task failures |
| Service actions | Service-level operations | Track scaling, deployments |
| Deployment states | Deployment status changes | Debug rolling updates |
| Container instance changes | Agent and instance status | Monitor cluster capacity |

### EventBridge Capture Pattern

```json
{
  "source": ["aws.ecs"],
  "detail": {
    "clusterArn": ["arn:aws:ecs:<region>:<account>:cluster/<cluster-name>"]
  }
}
```

### Useful Insights Queries

```sql
-- Failed tasks in last hour
fields @timestamp, detail.clusterArn, detail.taskArn, detail.lastStatus
| filter detail.lastStatus = "STOPPED"
| filter detail.stopCode != "EssentialContainerExited"
| sort @timestamp desc
```

```sql
-- Service deployment events
fields @timestamp, detail.serviceName, detail.event
| filter detail.event like /SERVICE_DEPLOYMENT/
| sort @timestamp desc
```

## 6. OpenTelemetry on ECS (Modern Approach)

**Note:** AWS X-Ray SDK/Daemon entered maintenance mode Feb 25, 2026. Use OpenTelemetry + ADOT for new instrumentations.

### ADOT Sidecar on ECS

```json
{
  "containerDefinitions": [
    {
      "name": "app",
      "image": "your-app:latest",
      "environment": [
        { "name": "OTEL_EXPORTER_OTLP_ENDPOINT", "value": "http://localhost:4317" }
      ]
    },
    {
      "name": "otel-collector",
      "image": "public.ecr.aws/aws-observability/aws-otel-collector:latest",
      "portMappings": [{ "containerPort": 4317, "protocol": "tcp" }]
    }
  ]
}
```

### Correlating Traces with Logs

Include trace ID in log output:

```json
{
  "timestamp": "2025-07-22T10:30:00Z",
  "level": "ERROR",
  "traceId": "abc-123-def-456",
  "spanId": "span-789",
  "message": "Payment processing failed"
}
```

This enables pivot from log entry → full trace in X-Ray/any OTel backend.

## 7. Catch-Block Audit (Masked Error Detection)

**The most pernicious pattern in microservice debugging:** When a `catch` block transforms an exception and throws a generic one, the **original error is lost**. You end up investigating a secondary NullReferenceException while the primary cause (DB deadlock, deserialization failure) remains hidden.

### Detection Pattern

If error logs show a generic exception (NullRef, ArgNull) but NO primary DB/network error preceding it, the catch block likely swallowed the original.

```bash
# Find generic exceptions without preceding context errors
aws logs filter-log-events \
  --log-group-name "/ecs/<cluster>" \
  --filter-pattern '"NullReferenceException" OR "ArgumentNullException"' \
  --start-time <start> --end-time <end> \
  --interleaved --profile <profile>
```

### Code Audit Checklist

| Pattern | Problem | Fix |
|---------|---------|-----|
| `catch (Exception ex) { throw new X(); }` | Swallows original, no chaining | Use `throw new X(ex)` or `throw new X(innerException: ex)` |
| `catch { throw; }` without logging | Exception lost if chain breaks | Log original FIRST, then re-throw |
| Catch-all `catch (Exception)` | Catches expected + unexpected | Catch specific exception types |
| Empty catch block | Silently eats error | Never leave catch blocks empty |

### Best Practices (Microsoft/Oracle)

1. **Catch only what you can handle** — Let unrecoverable exceptions propagate
2. **Always chain exceptions** — Pass original as `InnerException` (C#) or `cause` (Java)
3. **Log before throwing** — Ensure primary error survives in logs even if chain breaks
4. **Use structured error responses** — Return error IDs correlatable to server-side logs
