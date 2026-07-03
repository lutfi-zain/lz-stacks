# Opportunity Scanning

A methodology to scan conversational histories and identify high-leverage workflows suitable for automation.

## 1. The Repeatability Threshold
A task must meet the following criteria to qualify as a skill candidate:
- **Frequency:** It has occurred at least 3 times in your recent chat history. Two occurrences is a coincidence; three is a pattern.
- **ROI Leverage:** Calculate `Frequency × (Manual Execution Time - Automated Execution Time)`. Prioritize skills that save at least 15 minutes per week.
- **Complexity:** The task has a structured process but requires cognitive decisions (e.g., code review, content mapping). If it is a simple key-value replace, use an alias or script instead.

---

## 2. Scanning Workflow

### Step 1: Query Logs
Use `recent_chats` and `conversation_search` tools to scan conversations from the past 90 days. Group queries by keywords (e.g., *"deploy"*, *"refactor"*, *"write"*).

### Step 2: Rationale Filtering
Propose skill candidates by documenting:
- The specific repeated task.
- The frequency evidence (citing exact chat IDs).
- The trigger keyword list.
- Estimated weekly ROI.

### Step 3: Anti-Pattern Check (What NOT to make a skill)
To prevent skill bloat, reject candidates that are:
- Vague or generic (e.g., *"how to write code"*).
- One-off configurations.
- Tasks easily handled by shell scripts or native IDE tools.
