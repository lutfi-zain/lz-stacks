# Behavioral Patterns Section — Drop-In Template

> Use this template when injecting into `AGENTS.md` or `CLAUDE.md` in **Behavioral Mode** and the file has **no** existing `## Behavioral Patterns` section. Otherwise, anchor on the existing section.

## Research Basis

This template is grounded in three independent research threads:

| Source | Contribution |
| --- | --- |
| **SkillX** (arXiv 2604.04804) | Trajectory compression: filter out exploration/backtracking/trial-error, keep only optimal path |
| **Letta Skill Learning** (2025) | Two-stage reflection: evaluate trajectory → create skill from compressed pattern |
| **Self-Improving Agents via Accumulated Behavioral Rules** (arXiv 2607.13091) | Persistent behavioral rules from review feedback; monotonic improvement |

## Drop-In Section

Copy the block below. Replace `{{DATE}}` with `YYYY-MM-DD` and fill in the rows.

````markdown
## Behavioral Patterns

> Agent behavioral optimizations derived from session trajectory analysis.
> Auto-maintained by the `lz-session-learn` skill in Behavioral Mode.
> Each row encodes: **trigger scenario → optimal first step → rationale**.
> New rows go at the **top**, just below this header.

- **[{{DATE}}]** When [trigger scenario]: skip [wasted approach], start with [optimal approach].
  Rationale: [why the wasted approach fails].
  Evidence: [N retries → compressed to direct path, tool sequence]
- **[{{DATE}}]** When [trigger scenario]: [optimal tool ordering].
  Rationale: [why this ordering works].
  Evidence: [session timeline: attempted sequence]
- **[{{DATE}}]** [Tool-choice optimization]: use [simple tool] instead of [complex tool] for [task].
  Rationale: [why complex tool is overkill / fails].
  Evidence: [observed failure with complex tool]
````

## Conventions

- **Trigger-first**: start the row with `When [scenario]:` so the next agent can pattern-match.
- **Verb-driven**: "skip X, start with Y" — imperative, actionable.
- **Rationale required**: every behavioral row must say *why* the old approach fails. Without rationale, the next agent may not trust the shortcut.
- **Evidence**: how many retries were compressed, or the tool sequence that was observed.
- **No project facts**: if the row reads like a codebase convention, it belongs in `## Learnings`, not here.
- **Most recent first**: new rows at the top, just under the header.

## Row Anatomy

```
- **[DATE]** When [trigger]: [action]. Rationale: [why]. Evidence: [proof]
  ^^^^^^^^^   ^^^^^^^^^^^^^^^^   ^^^^^^^^^   ^^^^^^^^^^^^^^   ^^^^^^^^
  stamp       scenario trigger  imperative  justification     verifiable proof
```

## Examples

### Good (Behavioral Mode)

```markdown
## Behavioral Patterns

- **[2026-06-02]** When debugging HIS ECS services: skip `execute-command`
  (no SSM agent), start with `CloudWatch filter-log-events` directly.
  Rationale: execute-command always fails with TargetNotConnectedException
  on HIS containers.
  Evidence: 2 failed execute-command attempts → switched to filter-log-events
  → got logs immediately.

- **[2026-05-28]** When user asks to check AWS service config: read
  Secrets Manager `get-secret-value` before checking Task Definition env vars.
  Rationale: Task Definition often shows `environment: []` even when config
  is loaded at runtime via SecretStorage.syncSecret().
  Evidence: wasted 2 rounds checking Task Definition before verifying
  Secrets Manager.
```

### Bad (Wrong section or missing rationale)

```markdown
## Behavioral Patterns

- **[2026-06-02]** execute-command fails on HIS containers.
  (Missing: what to do INSTEAD? No rationale, no scenario trigger.)

- **[2026-06-02]** Use pnpm test --run in CI.
  (This is a project convention → belongs in ## Learnings, not here.)
```

## Where in the File to Place the Section

- **Above**: any `## Learnings` section (behavioral patterns should be read first — they change agent conduct).
- **Below**: any `## Hard Rules` section (hard rules outrank behavioral optimizations).
- **Not at the bottom**: bottom-of-file appends get lost.

## Companion Section: `## Learnings`

When the same session has both project facts and behavioral patterns, the file should have both sections. Example:

```markdown
## Behavioral Patterns

> Agent behavioral optimizations.

- **[2026-06-02]** When debugging ECS: skip execute-command, use filter-log-events.
  ...

## Learnings

> Project facts and conventions.

- **[2026-06-02]** Use `pnpm test --run` in CI.
  ...
```

This dual-section layout lets the next agent distinguish "what should I do?" (Behavioral Patterns) from "what does the project expect?" (Learnings).

## Diff Preview (what the skill should produce)

```diff
+## Behavioral Patterns
+
+> Agent behavioral optimizations derived from session trajectory analysis.
+
+- **[2026-06-02]** When debugging HIS ECS services: skip `execute-command`
+  (no SSM agent), start with `CloudWatch filter-log-events` directly.
+  Rationale: execute-command always fails with TargetNotConnectedException
+  on HIS containers.
+  Evidence: 2 failed execute-command attempts → switched to filter-log-events.
```

If the user runs `/session-learn --behave --dry-run`, show only this diff and wait for confirmation.

## Cross-References

- `../SKILL.md` — full workflow (Phase 4 WRITE for Behavioral Mode)
- `../references/extraction-heuristics.md` — behavioral signal taxonomy and retention filter
- `../assets/LEARNINGS_SECTION.md` — companion Knowledge Mode template
- `../assets/EXTRACTION_CHECKLIST.md` — pre-write verification (updated for behavioral)
