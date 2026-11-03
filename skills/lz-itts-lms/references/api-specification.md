# ITTS Civitas LMS (Sevima) API Specification

Technical reverse-engineered specification of the ITTS LMS REST API Gateway (`https://lms.itts.ac.id/v2/`).

---

## 1. Authentication & Security Architecture

### 1.1 Why REST API Over Browser Automation
The Civitas LMS frontend uses **TryCap (Cap.dev)** proof-of-work (PoW) captcha alongside server-side instrumentation checks. Headless browsers are flagged on server validation by text metric quantization, `window_exceeds_screen`, and headless engine markers.

In contrast, the underlying identity gateway (`identity-multisite-service` behind Kong) exposes a direct OAuth2/password grant REST endpoint that accepts standard authentication with the campus ID header:

```http
POST /v2/access_token HTTP/1.1
Host: lms.itts.ac.id
Content-Type: application/json
college-id: 042015
User-Agent: Mozilla/5.0

{
  "client_id": "web",
  "grant_type": "password",
  "target_role": "ROLE_MAHASISWA",
  "username": "<NIM_MAHASISWA>",
  "password": "<PASSWORD_MAHASISWA>"
}
```

### 1.2 Required Request Headers
Every authenticated API request must include:
```http
Content-Type: application/json
college-id: 042015
Authorization: Bearer <access_token>
User-Agent: Mozilla/5.0
```

- **College ID ITTS**: `042015` (Kemendikbudristek institutional code).
- **Token Expiry**: Default 64,800 seconds (18 hours).

---

## 2. API Endpoints Catalog

### 2.1 User Profile & Identity
- `GET /v2/user_info`
  - Validates active token.
  - Returns `id`, `username`, `role` (`ROLE_MAHASISWA`), and scopes (`F5:B`, `F6:B`).

### 2.2 Classes & Schedule (Kelas Kuliah)
- `GET /v2/lms/kelas_kuliah?periode={periode}`
  - Mandatory query parameter: `periode` (e.g., `20261` for Odd Semester 2026/2027).
  - Returns array of enrolled courses, SKS weight, lecturer info, class schedule (day, hours), and room allocation.
- `GET /v2/lms/kelas_kuliah/{id_kelas_kuliah}`
  - Detailed metadata, capacity, and syllabus configuration.
- `GET /v2/lms/kelas_kuliah/{id_kelas_kuliah}/peserta`
  - Complete roster of students enrolled in the class.

### 2.3 Sessions & Meetings (Pertemuan)
- `GET /v2/lms/kelas_kuliah/{id_kelas_kuliah}/pertemuan`
  - Returns list of 16 weekly meetings.
  - Meeting fields: `urutan`, `judul`, `status` (`selesai` / `belum_dimulai`), `count_activity` (`materi`, `tugas`, `ujian`, `forum`), and attendance requirements.
- `GET /v2/lms/pertemuan/{id_pertemuan}`
  - Specific meeting detail and instructions.

### 2.4 Learning Materials (Materi)
- `GET /v2/lms/materi?id_kelas_kuliah={id_kelas_kuliah}`
  - Optional filter: `&id_pertemuan={id_pertemuan}`.
  - Returns learning modules, file types (`ebook`, `url`), pre-signed AWS S3 download URLs, and `is_syarat_hadir` flag.

### 2.5 Assignments (Tugas)
- `GET /v2/lms/tugas?id_kelas_kuliah={id_kelas_kuliah}`
  - Lists assignments, instruction descriptions, submission deadlines, and grading rubrics.
- `GET /v2/lms/tugas/{id_tugas}/pengumpulan/me`
  - Checks student's submission status, uploaded files, and feedback from lecturers.
- `PUT /v2/lms/tugas/{id_tugas}/pengumpulan`
  - Submits document files or external links (e.g. GitHub, Google Drive).

### 2.6 Quizzes & Exams (Ujian / CBT)
- `GET /v2/lms/ujian?limit=50&status={status}`
  - Filters: `berlangsung`, `belum_dimulai`, or `selesai`.
  - Returns exam title, duration, question count, open/closed book rules (`sifat`), and start/end timestamps.
- `POST /v2/lms/ujian/{id_ujian}/pengerjaan/start`
  - Starts CBT session and initializes countdown timer.
- `GET /v2/lms/pengerjaan/{id_pengerjaan}/refresh_timer`
  - Heartbeat and anti-cheat blur detection synchronization.
- `PATCH /v2/lms/ujian/{id_ujian}/pengerjaan/kelompok_soal/{group_id}/soal/{soal_id}`
  - Autosaves answers per question.
- `POST /v2/lms/ujian/{id_ujian}/pengerjaan/finish`
  - Submits and finalizes the exam.

### 2.7 Attendance (Kehadiran / Presensi)
- `GET /v2/lms/kehadiran_mahasiswa/kelas_kuliah/{id_kelas_kuliah}/me`
  - Returns student's attendance records across all 16 sessions.
  - Status mapping: `H` (Hadir), `A` (Alpha), `I` (Izin), `S` (Sakit).
  - Presensi mechanism: In online sessions, `is_hadir` is automatically logged by `LMS:SYSTEM` when attendance conditions (downloading required material / forum post / quiz) are met.

### 2.8 Academic Grades (Nilai)
- `GET /v2/lms/nilai/me?periode={periode}`
  - Returns published grades per course: `nilai_angka`, `nilai_huruf`, and scoring breakdown (`komponen`).
