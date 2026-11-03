#!/usr/bin/env python3
"""
ITTS Civitas LMS Automation CLI
Backend client for https://lms.itts.ac.id
Supports class listing, meetings, syllabus, assignments, quizzes, exams, attendance, and grades.

Security Note:
This script contains NO hardcoded credentials. It reads credentials from:
1. Command line arguments (--username, --password)
2. Environment variables (ITTS_LMS_USERNAME, ITTS_LMS_PASSWORD)
3. Local secure session cache in ~/.local/state/itts-lms/
"""

import sys
import os
import json
import argparse
import urllib.request
import urllib.error
from datetime import datetime, timezone

SESSION_DIR = os.path.expanduser("~/.local/state/itts-lms")
SESSION_FILE = os.path.join(SESSION_DIR, "session.json")
CREDENTIALS_FILE = os.path.join(SESSION_DIR, "credentials.json")

BASE_URL = "https://lms.itts.ac.id"
COLLEGE_ID = "042015"
DEFAULT_PERIODE = "20261"


def get_headers(access_token=None):
    headers = {
        "Content-Type": "application/json",
        "college-id": COLLEGE_ID,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    if access_token:
        headers["Authorization"] = f"Bearer {access_token}"
    return headers


def api_request(method, endpoint, data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = get_headers(token)
    payload = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=payload, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="ignore")
        try:
            err_json = json.loads(error_body)
            raise RuntimeError(f"HTTP {e.code}: {json.dumps(err_json)}")
        except Exception:
            raise RuntimeError(f"HTTP {e.code}: {error_body}")


def load_session():
    if not os.path.exists(SESSION_FILE):
        return None
    try:
        with open(SESSION_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return None


def save_session(session_data):
    os.makedirs(SESSION_DIR, exist_ok=True)
    with open(SESSION_FILE, "w") as f:
        json.dump(session_data, f, indent=2)


def login(username=None, password=None):
    if not username or not password:
        username = os.environ.get("ITTS_LMS_USERNAME")
        password = os.environ.get("ITTS_LMS_PASSWORD")

    if not username or not password:
        if os.path.exists(CREDENTIALS_FILE):
            try:
                with open(CREDENTIALS_FILE, "r") as f:
                    creds = json.load(f)
                    username = username or creds.get("username")
                    password = password or creds.get("password")
            except Exception:
                pass

    if not username or not password:
        sess = load_session()
        if sess and sess.get("access_token"):
            return sess["access_token"]
        raise RuntimeError("Username and password required. Provide via args, env vars (ITTS_LMS_USERNAME/ITTS_LMS_PASSWORD), or session file.")

    payload = {
        "client_id": "web",
        "grant_type": "password",
        "target_role": "ROLE_MAHASISWA",
        "username": username,
        "password": password
    }
    res = api_request("POST", "/v2/access_token", data=payload)
    access_token = res.get("access_token")
    if not access_token:
        raise RuntimeError(f"Login failed: {res}")

    session_data = {
        "base_url": BASE_URL,
        "college_id": COLLEGE_ID,
        "access_token": access_token,
        "refresh_token": res.get("refresh_token"),
        "expires_in": res.get("expires_in"),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "user": {
            "nim": username,
            "role": "ROLE_MAHASISWA"
        }
    }
    save_session(session_data)

    try:
        with open(CREDENTIALS_FILE, "w") as f:
            json.dump({"username": username, "password": password}, f, indent=2)
        os.chmod(CREDENTIALS_FILE, 0o600)
    except Exception:
        pass

    return access_token


def get_valid_token():
    sess = load_session()
    if sess and sess.get("access_token"):
        token = sess["access_token"]
        try:
            api_request("GET", "/v2/user_info", token=token)
            return token
        except Exception:
            pass
    return login()


def cmd_classes(args):
    token = get_valid_token()
    periode = args.periode or DEFAULT_PERIODE
    res = api_request("GET", f"/v2/lms/kelas_kuliah?periode={periode}", token=token)
    classes = res.get("data", [])
    if args.json:
        print(json.dumps(classes, indent=2))
        return

    print(f"\n📚 Daftar Kelas Kuliah — Periode {periode} ({len(classes)} Mata Kuliah)")
    print("=" * 80)
    for c in classes:
        cls_id = c.get("id", "-")
        mk = c.get("mata_kuliah", {})
        code = mk.get("kode", "-")
        name = mk.get("nama", "-")
        sks = mk.get("sks", "-")
        lecturers = []
        for p in c.get("pengajar", []):
            g_depan = p.get("gelar_depan", "").strip()
            nama_p = p.get("nama_pengajar", "").strip()
            g_belakang = p.get("gelar_akademik", "").strip()
            full_name = f"{g_depan} {nama_p} {g_belakang}".strip()
            if full_name:
                lecturers.append(full_name)
        lecturer_str = ", ".join(lecturers) if lecturers else "Belum ditentukan"
        schedules = []
        for j in c.get("jadwal", []):
            hari = j.get("hari", "")
            jam = f"{j.get('jam_mulai', '')}-{j.get('jam_selesai', '')}"
            ruang = j.get("ruangan", {}).get("nama", "")
            schedules.append(f"{hari} {jam} ({ruang})" if ruang else f"{hari} {jam}")
        schedule_str = "; ".join(schedules) if schedules else "Jadwal Online/Fleksibel"

        print(f"[{code}] {name} ({sks} SKS)")
        print(f"  ID Kelas : {cls_id}")
        print(f"  Dosen    : {lecturer_str}")
        print(f"  Jadwal   : {schedule_str}")
        print("-" * 80)


def cmd_meetings(args):
    token = get_valid_token()
    cls_id = args.class_id
    res = api_request("GET", f"/v2/lms/kelas_kuliah/{cls_id}/pertemuan", token=token)
    meetings = res.get("data", [])
    if args.json:
        print(json.dumps(meetings, indent=2))
        return

    print(f"\n🗓️ Daftar Pertemuan Kelas: {cls_id} ({len(meetings)} Pertemuan)")
    print("=" * 80)
    for m in meetings:
        no = m.get("nomor", m.get("urutan", "-"))
        nama = m.get("judul", m.get("nama_pertemuan", f"Pertemuan {no}"))
        status = m.get("status", "-")
        acts = m.get("count_activity", {})
        act_summary = f"Materi: {acts.get('materi', 0)} | Tugas: {acts.get('tugas', 0)} | Ujian: {acts.get('ujian', 0)} | Forum: {acts.get('forum', 0)}"
        print(f"Pertemuan {no}: {nama} [{status.upper()}]")
        print(f"  Aktivitas: {act_summary}")
        if m.get("waktu_mulai") and m.get("waktu_selesai"):
            print(f"  Waktu    : {m.get('waktu_mulai')} s/d {m.get('waktu_selesai')}")
        print("-" * 80)


def cmd_materials(args):
    token = get_valid_token()
    cls_id = args.class_id
    endpoint = f"/v2/lms/materi?id_kelas_kuliah={cls_id}"
    if args.meeting_id:
        endpoint += f"&id_pertemuan={args.meeting_id}"
    res = api_request("GET", endpoint, token=token)
    materials = res.get("data", [])
    if args.json:
        print(json.dumps(materials, indent=2))
        return

    print(f"\n📂 Daftar Materi Pembelajaran: {cls_id} ({len(materials)} Berkas/Modul)")
    print("=" * 80)
    for item in materials:
        judul = item.get("judul", "-")
        tipe = item.get("tipe_materi", item.get("tipe", "-"))
        syarat = "Wajib (Syarat Hadir)" if item.get("is_syarat_hadir") else "Opsional"
        lampiran = item.get("lampiran", {})
        file_url = lampiran.get("url", "-") if isinstance(lampiran, dict) else "-"
        print(f"• {judul} [{str(tipe).upper()}] ({syarat})")
        if file_url != "-":
            print(f"  Link: {file_url}")
        print("-" * 80)


def cmd_tasks(args):
    token = get_valid_token()
    periode = args.periode or DEFAULT_PERIODE
    res = api_request("GET", f"/v2/lms/kelas_kuliah?periode={periode}", token=token)
    classes = res.get("data", [])
    all_tasks = []

    for c in classes:
        cls_id = c.get("id")
        mk_name = c.get("mata_kuliah", {}).get("nama", cls_id)
        try:
            t_res = api_request("GET", f"/v2/lms/tugas?id_kelas_kuliah={cls_id}", token=token)
            for t in t_res.get("data", []):
                t["kelas_nama"] = mk_name
                t["kelas_id"] = cls_id
                all_tasks.append(t)
        except Exception:
            pass

    if args.json:
        print(json.dumps(all_tasks, indent=2))
        return

    print(f"\n📝 Daftar Tugas Perkuliahan — Periode {periode} ({len(all_tasks)} Tugas)")
    print("=" * 80)
    if not all_tasks:
        print("🎉 Tidak ada tugas tertunda saat ini.")
    for t in all_tasks:
        judul = t.get("judul", "-")
        kelas = t.get("kelas_nama", "-")
        deadline = t.get("waktu_selesai", "-")
        status = t.get("status_pengumpulan", "Belum Dikumpulkan")
        print(f"• [{kelas}] {judul}")
        print(f"  Deadline : {deadline}")
        print(f"  Status   : {status}")
        print("-" * 80)


def cmd_exams(args):
    token = get_valid_token()
    status_filter = args.status
    endpoint = "/v2/lms/ujian?limit=50"
    if status_filter:
        endpoint += f"&status={status_filter}"
    res = api_request("GET", endpoint, token=token)
    exams = res.get("data", [])
    if args.json:
        print(json.dumps(exams, indent=2))
        return

    title_status = f"Status: {status_filter}" if status_filter else "Semua Status"
    print(f"\n⏱️ Daftar Kuis & Ujian Mahasiswa ({title_status}) — {len(exams)} Ujian")
    print("=" * 80)
    if not exams:
        print("Tidak ada ujian aktif saat ini.")
    for e in exams:
        judul = e.get("judul", "-")
        eid = e.get("id", "-")
        status = e.get("status", "-")
        durasi = e.get("durasi", 0)
        start = e.get("waktu_mulai", "-")
        finish = e.get("waktu_selesai", "-")
        sifat = e.get("sifat", "-")
        soal = e.get("jumlah_soal", "-")
        print(f"• {judul} [{status.upper()}] (ID: {eid})")
        print(f"  Soal     : {soal} butir | Durasi: {durasi} menit | Sifat: {sifat}")
        print(f"  Mulai    : {start}")
        print(f"  Deadline : {finish}")
        print("-" * 80)


def cmd_attendance(args):
    token = get_valid_token()
    periode = args.periode or DEFAULT_PERIODE
    res = api_request("GET", f"/v2/lms/kelas_kuliah?periode={periode}", token=token)
    classes = res.get("data", [])

    if args.class_id:
        classes = [c for c in classes if c.get("id") == args.class_id]

    print(f"\n📊 Rekapitulasi Kehadiran Mahasiswa — Periode {periode}")
    print("=" * 80)

    for c in classes:
        cls_id = c.get("id")
        mk_name = c.get("mata_kuliah", {}).get("nama", cls_id)
        try:
            att_res = api_request("GET", f"/v2/lms/kehadiran_mahasiswa/kelas_kuliah/{cls_id}/me", token=token)
            sessions = att_res.get("data", [])
            hadir_count = sum(1 for s in sessions if s.get("is_hadir"))
            total_held = sum(1 for s in sessions if s.get("pertemuan", {}).get("status") == "selesai")
            pct = (hadir_count / total_held * 100) if total_held > 0 else 100.0

            print(f"📖 {mk_name} (ID: {cls_id})")
            print(f"   Tingkat Kehadiran: {hadir_count}/{total_held} sesi terlaksana ({pct:.1f}%)")
            for s in sessions:
                p = s.get("pertemuan", {})
                p_no = p.get("nomor", "-")
                p_nama = p.get("judul") or f"Pertemuan {p_no}"
                p_stat = p.get("status", "-")
                pres = s.get("presensi", {})
                pres_label = pres.get("label", "Belum Presensi") if isinstance(pres, dict) else "Belum Presensi"
                is_h = "✅ HADIR" if s.get("is_hadir") else ("⏳ PENDING" if p_stat != "selesai" else "❌ TIDAK HADIR")
                print(f"   - P{p_no}: {p_nama} -> {is_h} ({pres_label})")
            print("-" * 80)
        except Exception as err:
            print(f"📖 {mk_name}: Gagal mengambil data ({err})")
            print("-" * 80)


def cmd_grades(args):
    token = get_valid_token()
    periode = args.periode or DEFAULT_PERIODE
    res = api_request("GET", f"/v2/lms/nilai/me?periode={periode}", token=token)
    grades = res.get("data", [])
    if args.json:
        print(json.dumps(grades, indent=2))
        return

    print(f"\n🏆 Rekapitulasi Nilai Akademik — Periode {periode}")
    print("=" * 80)
    if not grades:
        print("Data nilai belum dipublikasikan untuk periode ini.")
    for g in grades:
        kelas = g.get("kelas", {})
        mk = kelas.get("mata_kuliah", {})
        nama = mk.get("nama", g.get("nama_mata_kuliah", "-"))
        kode = mk.get("kode", g.get("kode_mata_kuliah", "-"))
        angka = g.get("nilai_angka", "-")
        huruf = g.get("nilai_huruf", "-")
        print(f"[{kode}] {nama}")
        print(f"  Nilai Angka : {angka} | Nilai Huruf: {huruf}")
        komp = g.get("komponen", [])
        if komp:
            details = [f"{k.get('nama')}: {k.get('nilai')}" for k in komp]
            print(f"  Rincian     : {', '.join(details)}")
        print("-" * 80)


def cmd_dashboard(args):
    token = get_valid_token()
    periode = args.periode or DEFAULT_PERIODE

    # Fetch classes
    classes_res = api_request("GET", f"/v2/lms/kelas_kuliah?periode={periode}", token=token)
    classes = classes_res.get("data", [])

    # Fetch exams
    exams_res = api_request("GET", "/v2/lms/ujian?limit=50", token=token)
    exams = exams_res.get("data", [])
    active_exams = [e for e in exams if e.get("status") in ["berlangsung", "belum_dimulai"]]

    sess = load_session()
    user_name = sess.get("user", {}).get("nim", "Mahasiswa") if sess else "Mahasiswa"

    print("\n" + "=" * 60)
    print(f"🎓 DASHBOARD CIVITAS LMS ITTS — Periode {periode}")
    print("=" * 60)
    print(f"👤 Pengguna : {user_name}")
    print(f"📚 Mata Kuliah Terdaftar : {len(classes)} Kelas Aktif")
    print(f"⏱️ Kuis/Ujian Terjadwal   : {len(active_exams)} Aktif")
    print("-" * 60)

    print("\n📋 MATA KULIAH AKTIF:")
    for c in classes:
        mk = c.get("mata_kuliah", {})
        print(f"  • [{mk.get('kode')}] {mk.get('nama')} ({mk.get('sks')} SKS)")

    print("\n🚨 KUIS & UJIAN PERLU PERHATIAN:")
    if not active_exams:
        print("  (Tidak ada kuis/ujian aktif)")
    for e in active_exams:
        print(f"  • {e.get('judul')} [{e.get('status').upper()}]")
        print(f"    Durasi: {e.get('durasi')} min | Selesai: {e.get('waktu_selesai')}")

    print("=" * 60 + "\n")


def main():
    parser = argparse.ArgumentParser(description="ITTS Civitas LMS CLI")
    subparsers = parser.add_subparsers(dest="subcommand", required=True)

    # login
    p_login = subparsers.add_parser("login", help="Login to LMS ITTS")
    p_login.add_argument("--username", "-u", help="Student NIM")
    p_login.add_argument("--password", "-p", help="Student password")

    # dashboard
    p_dash = subparsers.add_parser("dashboard", help="Display overview dashboard")
    p_dash.add_argument("--periode", default=DEFAULT_PERIODE)

    # classes
    p_cls = subparsers.add_parser("classes", help="List active classes")
    p_cls.add_argument("--periode", default=DEFAULT_PERIODE)
    p_cls.add_argument("--json", action="store_true")

    # meetings
    p_meet = subparsers.add_parser("meetings", help="List meetings of a class")
    p_meet.add_argument("class_id", help="Class ID (e.g., 20261_1_SI148_102)")
    p_meet.add_argument("--json", action="store_true")

    # materials
    p_mat = subparsers.add_parser("materials", help="List materials of a class")
    p_mat.add_argument("class_id", help="Class ID")
    p_mat.add_argument("--meeting-id", help="Filter by meeting ID")
    p_mat.add_argument("--json", action="store_true")

    # tasks
    p_task = subparsers.add_parser("tasks", help="List assignments")
    p_task.add_argument("--periode", default=DEFAULT_PERIODE)
    p_task.add_argument("--json", action="store_true")

    # exams
    p_exam = subparsers.add_parser("exams", help="List quizzes and exams")
    p_exam.add_argument("--status", choices=["berlangsung", "belum_dimulai", "selesai"])
    p_exam.add_argument("--json", action="store_true")

    # attendance
    p_att = subparsers.add_parser("attendance", help="List attendance summary")
    p_att.add_argument("--class-id", help="Filter by class ID")
    p_att.add_argument("--periode", default=DEFAULT_PERIODE)
    p_att.add_argument("--json", action="store_true")

    # grades
    p_grd = subparsers.add_parser("grades", help="List academic grades")
    p_grd.add_argument("--periode", default=DEFAULT_PERIODE)
    p_grd.add_argument("--json", action="store_true")

    args = parser.parse_args()

    handlers = {
        "login": lambda a: login(a.username, a.password),
        "dashboard": cmd_dashboard,
        "classes": cmd_classes,
        "meetings": cmd_meetings,
        "materials": cmd_materials,
        "tasks": cmd_tasks,
        "exams": cmd_exams,
        "attendance": cmd_attendance,
        "grades": cmd_grades
    }

    try:
        handlers[args.subcommand](args)
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
