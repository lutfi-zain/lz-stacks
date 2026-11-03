<div align="center">

# `lz-itts-lms`

### *Zero-overhead automation & monitoring for ITTS Civitas LMS*

[![Spec](https://img.shields.io/badge/Agent%20Skills-v1-blueviolet)](https://agentskills.io/specification)
[![Python: 3.8+](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./SKILL.md)

`/skill:lz-itts-lms` · `cek lms` · `tugas lms itts` · `jadwal kuliah itts` · `kuis itts` · `absensi itts`

</div>

---

## ⚡ Overview

`lz-itts-lms` provides automated monitoring, schedule tracking, task alerts, and grade querying for the **Institut Teknologi Tangerang Selatan (ITTS)** Civitas LMS platform (`https://lms.itts.ac.id`).

Unlike slow, brittle browser scrapers that get tripped by frontend bot protection (TryCap PoW), this skill interacts directly with the high-performance backend Kong REST API gateway (`/v2/`), completing operations in < 200ms.

---

## 🚀 Quick Start

### 1. Configure Authentication
Set your student credentials via environment variables:

```bash
export ITTS_LMS_USERNAME="<NIM>"
export ITTS_LMS_PASSWORD="<PASSWORD>"
```

*(Alternatively, pass `--username` and `--password` flags on first run. Active session tokens are stored securely in `~/.local/state/itts-lms/session.json` outside the repo).*

### 2. Available Commands

```bash
# Executive summary: classes, active quizzes, and alerts
python3 skills/lz-itts-lms/scripts/lms.py dashboard

# View enrolled courses, SKS, lecturers, and schedules
python3 skills/lz-itts-lms/scripts/lms.py classes

# Check upcoming and ongoing quizzes / exams with remaining time
python3 skills/lz-itts-lms/scripts/lms.py exams

# Check pending assignments across all courses
python3 skills/lz-itts-lms/scripts/lms.py tasks

# View attendance records and presence percentage
python3 skills/lz-itts-lms/scripts/lms.py attendance

# List 16 meeting sessions for a course
python3 skills/lz-itts-lms/scripts/lms.py meetings <CLASS_ID>

# List and download lecture materials
python3 skills/lz-itts-lms/scripts/lms.py materials <CLASS_ID>

# Check semester academic grades
python3 skills/lz-itts-lms/scripts/lms.py grades
```

---

## 📚 Technical Documentation

- [API Specification](./references/api-specification.md): Complete catalog of REST endpoints for classes, CBT exam engine, attendance, and grading.
- [Agent Skill Rules](./SKILL.md): Standard specification rules and trigger definitions.
