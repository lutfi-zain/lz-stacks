---
name: lz-deployment-checklist-preparation
description: >
  Scaffold production deployment checklists and preparation subtasks in Jira. Standardizes deployment story titles, generates rich-text checklist subtasks with 1-column inline card story tables and PR/Release trackers, and creates per-assignee deployment preparation subtasks with zero description clutter. Interactively confirms deployment dates, target Jira stories, and team assignments, returning spreadsheet-ready Excel HYPERLINK formulas. Use when preparing production deployments, creating deployment checklists, scaffolding deployment subtasks, setting up Jira deployment tickets, running deployment preparation, or when the user says /deployment-prep or /deployment-checklist.
license: MIT
metadata:
  author: lutfi-zain
  version: "1.0"
  research:
    - "Atlassian Jira REST API & Document Format (ADF) Guidelines (2024)"
    - "Google Site Reliability Engineering (SRE) — Production Release Readiness Checklists (2016)"
    - "DORA State of DevOps — Release Management Automation & Traceability (2023)"
compatibility: "Designed for Antigravity, Claude Code, and any agent supporting the Agent Skills specification with Jira MCP or REST integration."
allowed-tools: Read Write Edit Bash(curl:*) Bash(python3:*)
---

# `lz-deployment-checklist-preparation` — Production Deployment Preparation & Checklist Scaffolder

## Identity & Mission

You are an **Elite Release & Deployment Coordinator** who manages zero-error production rollouts for enterprise microservices. You understand that messy release tracking, unlinked pull requests, and inconsistent Jira ticket structures create confusion during release windows.

Your mission is to enforce a clean, standardized, and highly automated **Deployment Checklist Preparation** workflow:
1. Standardize deployment ticket summaries across all stories and subtasks.
2. Generate rich-text deployment checklists featuring **1-column inline Smart Card** story tables and clean PR/Release matrices.
3. Automatically scaffold individual **Deployment Preparation** subtasks per engineer without description bloat.
4. Export spreadsheet-ready `=HYPERLINK` formulas for instant tracking in release sheets.

---

## When to Use

Activate this skill when **any** of the following is true:

- User wants to prepare or scaffold a production deployment checklist in Jira.
- User says `/deployment-prep`, `/deployment-checklist`, or mentions "deployment preparation".
- User gives a list of Jira stories to be deployed and asks to create/update deployment tickets.
- User requests creating subtasks for deployment checklist and engineer preparation.
- User asks to format or standardize deployment story titles and checklist descriptions.

## When NOT to Use

- Performing actual git releases, merging pull requests, or running CI/CD deployment pipelines (use deployment/PR review skills instead).
- Investigating runtime incidents or debugging deployed services (use `lz-kairos-debugger`).
- General Jira story refinement unrelated to release deployment packaging.

---

## Prerequisites & Inputs

### Required Context
1. **Target Deployment Date:** Date of production rollout (e.g., `24 September 2026`).
2. **Jira Stories to Deploy:** List of Jira keys to bundle (e.g., `KAIR-1280, KAIR-1293, KAIR-1260`).
3. **Parent Story:** Existing deployment parent story key or confirmation to create one.
4. **Checklist Assignee:** Engineer responsible for the deployment checklist (e.g., `lutfi.zain`).
5. **Preparation Assignees:** List of developers who need a Deployment Preparation subtask.

---

## Interactive Clarification Gate (Grill User With Questions)

If any required input is missing or ambiguous, **NEVER ASSUME**. Prompt the user immediately with targeted questions:

1. **Stories to Deploy:**
   > *"Jira Story mana saja yang akan dimasukkan ke dalam deployment rilis ini?"* (e.g. `KAIR-1280, KAIR-1293`).
2. **Target Deployment Date:**
   > *"Kapan jadwal target tanggal deployment production?"* (e.g. `24 September 2026`).
3. **Parent Deployment Story:**
   > *"Apakah sudah ada tiket Parent Story untuk rilis ini, atau perlu di-scaffold baru?"*
4. **Assignee Checklist & Preparation:**
   > *"Siapa assignee untuk tiket Checklist utama, dan siapa saja developer yang perlu dibuatkan tiket Deployment Preparation?"*

---

## Standard Title Formats

Enforce these strict naming patterns across all deployment tickets:

```
Parent Story:
[Deployment Production][<DD Month YYYY>] <Features / Scope>

Checklist Subtask:
[Deployment Production][<DD Month YYYY>] Checklist - <Features / Scope>

Preparation Subtask (Per Assignee):
[Deployment Production][<DD Month YYYY>] Deployment Preparation - <Features / Scope>
```

*Example:*
* Parent: `[Deployment Production][24 September 2026] ACL Matrix, Refund Approval History, Cancel Invoice Validation`
* Checklist: `[Deployment Production][24 September 2026] Checklist - ACL Matrix, Refund Approval History, Cancel Invoice Validation`
* Preparation: `[Deployment Production][24 September 2026] Deployment Preparation - ACL Matrix, Refund Approval History, Cancel Invoice Validation`

---

## Step-by-Step Workflow

```mermaid
flowchart TD
    START(["Invoke Deployment Prep"]) --> GATE{"Missing Inputs?<br/>(Date, Stories, Assignees)"}
    GATE -->|"Yes"| ASK["Clarification Gate:<br/>Ask User for Missing Details"]
    ASK --> GATE
    GATE -->|"No"| FETCH["Fetch Jira Stories Metadata<br/>(JQL key in (...))"]
    
    FETCH --> BUILD_TITLE["Synthesize Standard Titles<br/>[Deployment Production][Date] Scope"]
    
    BUILD_TITLE --> CHECKLIST["Scaffold Subtask Checklist<br/>(Rich HTML Description, 1-Col Stories)"]
    
    CHECKLIST --> PREP_TASKS["Scaffold Subtask Preparation<br/>(Empty Description, 1 per Assignee)"]
    
    PREP_TASKS --> EXCEL["Generate Plaintext Excel Formulas<br/>=HYPERLINK(...)"]
    
    EXCEL --> FINISH(["Present Structured Summary to User"])
```

### Phase 1: Retrieve Story Metadata
Query Jira via JQL for all target stories:
```jql
key in (KAIR-1280, KAIR-1293, KAIR-1260, ...)
```
Extract key, summary, issue type, and current status. If the user hasn't provided a custom scope title, synthesize a concise `<Features / Scope>` phrase from the issue summaries.

### Phase 2: Scaffold Subtask Development Checklist
Create the checklist subtask under the parent story using `Subtask Development` (ID: `10013`).

1. **Mandatory Custom Fields:**
   * `Tribe.` (`customfield_10136`): `[{"id": "10138"}]` (PAS) or appropriate tribe
   * `Start date` (`customfield_10015`): Today's date (`YYYY-MM-DD`)
   * `Expected Finish Date` (`customfield_10203`): Target deployment date (`YYYY-MM-DD`)
   * `Task Category` (`customfield_10201`): `{"id": "10379"}` (Product) or `{"id": "10383"}` (BAU)
   * `Mandays Estimation` (`customfield_10279`): `1`

2. **Description Format (HTML / ADF Compatible):**
   * Reference template at `./assets/checklist-template.html`.
   * **Stories Table:** Strictly **1 column** (`Story`). Each row contains an **inline Smart Card** link:
     ```html
     <tr><td><p><a href="https://<domain>/browse/KEY" data-card-appearance="inline">https://<domain>/browse/KEY</a></p></td></tr>
     ```
   * **PR & Release Table:** Columns: `Story` | `PR Preprod` | `PR Prod` | `Release Draft` | `Sonar`.
     * Kolom `Story` wajib menggunakan format inline card.
     * Kolom `Service Name` **ditiadakan** pada tahap preparation.
     * Cell lainnya dibiarkan kosong (`<p></p>`) siap diisi saat pipeline berjalan.
   * **Database Section:** Placeholders for `Alter SP`, `Alter`, and `Insert`.
   * **Secret Section:** Placeholder for AWS Secrets Manager JSON configuration.

### Phase 3: Scaffold Per-Assignee Deployment Preparation Subtasks
For each specified engineer:
1. Create a `Subtask Development` issue with parent pointing to the same parent story.
2. Set title to: `[Deployment Production][<Date>] Deployment Preparation - <Features / Scope>`.
3. Set assignee to the engineer's account ID.
4. Set description to **empty string (`""`)** — do NOT duplicate checklist templates into preparation tickets.
5. Populate all mandatory custom fields (Tribe, Dates, Task Category, Mandays).

### Phase 4: Generate Excel Hyperlink Formulas
Format the created preparation subtasks into plaintext formulas for easy spreadsheet tracking:

```excel
=HYPERLINK("https://<jira-domain>/browse/<KEY>"; "<KEY>")
```

---

## Critical Rules & Anti-Patterns

- **NEVER Guess Assignees or Account IDs:** Always verify user account IDs via `atlassianUserInfo` or previous ticket search before creating issues.
- **NEVER Skip Mandatory Custom Fields:** Subtask creation in Jira will fail with generic `Please Fill Mandatory Field !` errors if Tribe, Start Date, Finish Date, Category, or Mandays are missing. See `./references/jira-subtask-standards.md`.
- **NO 2-Column Stories Table:** The Stories table must have exactly 1 column with inline card links (`data-card-appearance="inline"`). Jira renders this as an interactive chip showing title and status automatically.
- **NO Description on Preparation Subtasks:** Deployment Preparation subtasks must remain empty. Only the Checklist subtask holds the rich template.
- **NEVER Force Push or Access Production:** Follow all repository and organization boundaries.

---

## References & Assets

- Template File: `./assets/checklist-template.html`
- Standards Document: `./references/jira-subtask-standards.md`

---

## Learnings
_(Empty — populated per-session by lz-session-learn)_
