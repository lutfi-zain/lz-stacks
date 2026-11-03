---
name: lz-itts-lms
description: >
  Automation, monitoring, and query tool for ITTS Civitas LMS (https://lms.itts.ac.id).
  Use when asked to "cek lms", "cek lms itts", "tugas lms itts", "jadwal kuliah itts",
  "kuis itts", "ujian itts", "absensi itts", "presensi lms", "nilai itts", or
  interacting with student courses, assignments, quizzes, and materials.
license: MIT
metadata:
  author: lutfi-zain
  version: "1.0"
  platform: ITTS Civitas LMS (Sevima)
compatibility: Designed for Claude Code, Pi, and any agent supporting the Agent Skills specification. Requires python3 and standard unix tools.
allowed-tools: Read Write Edit Bash(python3:*) Bash(curl:*)
---

# `lz-itts-lms` — ITTS Civitas LMS Automation

A specialized, zero-overhead automation and monitoring tool for the **Institut Teknologi Tangerang Selatan (ITTS)** Civitas LMS portal (`https://lms.itts.ac.id`).

Bypasses heavy browser automation and frontend proof-of-work (TryCap) by interfacing directly with the backend Kong REST API gateway (`/v2/`), executing queries in under 0.2 seconds.

---

## When to Use

Use this skill when **any** of the following is true:
- The user asks to check current LMS status, active enrolled classes, or course schedules.
- The user asks about upcoming deadlines, pending assignments ("tugas"), or active quizzes ("kuis" / "ujian").
- The user wants to check attendance/presensi records and percentage across semester courses.
- The user wants to inspect or download course syllabus, lecture materials, or slides.
- The user asks to check academic grades ("nilai") or semester transcripts.
- Autonomous daily briefing or reminder loops for academic deadlines.

---

## Inputs & Security

- **Session File**: Cached in `~/.local/state/itts-lms/session.json` (outside git repository).
- **Credentials**: Provided via `--username` / `--password` arguments or environment variables:
  ```bash
  export ITTS_LMS_USERNAME="<NIM>"
  export ITTS_LMS_PASSWORD="<PASSWORD>"
  ```
- **Institution Code**: `042015` (Kemendikbudristek institutional ID for ITTS).
- **Target Semester**: Defaults to `20261` (Semester Ganjil 2026/2027).

---

## Core Workflows & Commands

All operations are executed via the CLI script:
`python3 skills/lz-itts-lms/scripts/lms.py <subcommand>`

| Subcommand | Description | Example Command |
|---|---|---|
| `dashboard` | Executive overview of enrolled courses, active quizzes, and alerts | `python3 scripts/lms.py dashboard` |
| `classes` | List registered courses, SKS, lecturers, schedule, and room | `python3 scripts/lms.py classes` |
| `exams` | List active, scheduled, or finished quizzes & exams with countdown | `python3 scripts/lms.py exams [--status berlangsung]` |
| `tasks` | Scan pending assignments across all classes and check deadlines | `python3 scripts/lms.py tasks` |
| `attendance`| Calculate attendance percentage and per-session status | `python3 scripts/lms.py attendance [--class-id <ID>]` |
| `meetings` | List all 16 meeting sessions and activity counts for a course | `python3 scripts/lms.py meetings <CLASS_ID>` |
| `materials`| List learning modules and pre-signed S3 download links | `python3 scripts/lms.py materials <CLASS_ID>` |
| `grades` | Retrieve gradebook and scoring component breakdown | `python3 scripts/lms.py grades` |

---

## Architecture & Reverse Engineering Insights

1. **REST Gateway vs Headless Browser**:
   The web frontend enforces TryCap proof-of-work with server-side text metric quantization and window boundary checks that flag headless browsers. Interfacing directly with `POST /v2/access_token` and `college-id: 042015` provides instant, 100% reliable programmatic access.

2. **Presence Mechanism**:
   In online lectures, attendance (`is_hadir`) is recorded automatically by `LMS:SYSTEM` when the required parameters (`is_syarat_hadir` in materi, forum discussion, or quiz submission) are met.

3. **Reference Docs**:
   - Technical endpoints catalog: [references/api-specification.md](./references/api-specification.md)

---

## Critical Rules

- **NEVER hardcode credentials or tokens in repository code, commits, or documentation.**
- **Read-only by default**: Checking status, schedules, and downloading materials are safe. Any mutation (answering CBT questions, submitting assignments, or closing exam timers) requires explicit user confirmation.
- **Token caching**: Session tokens expire after 18 hours (64,800s); the script automatically re-authenticates when expired.
