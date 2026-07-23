---
name: lz-kairos-debugger
description: Enterprise-grade AWS ECS/CloudWatch root-cause investigation skill. Fuses 5-Whys methodology, digital forensics, and architectural tracing to debug cross-service Kairos (HIS/PAS/PAY) failures, create timeline statistics, and generate sequence diagrams.
---

# LZ Kairos Debugger

Skill investigasi, troubleshooting, dan root-cause analysis (RCA) standar enterprise untuk arsitektur microservices AWS ECS, difokuskan pada ekosistem Kairos (HIS, PAS, PAY, CNDS).

## Kapan Menggunakan Skill Ini

Gunakan saat user meminta investigasi bug, error endpoint, lonjakan transaksi DB, atau anomali sistem di AWS ECS. Skill ini memaksa agen untuk menggunakan metodologi forensik digital, analisis arsitektural lintas layanan, dan teknik "5-Whys" agresif untuk menembus error sekunder (e.g. `catch` block) hingga menemukan akar masalah primer.

## Metodologi Investigasi (Wajib Diikuti Berurutan)

1. **Digital Forensics (Log Pertama, Asumsi Terakhir):**
   - JANGAN PERNAH menyentuh/mengedit kode sebelum investigasi selesai.
   - Ekstrak log primer dari AWS CloudWatch menggunakan `aws logs filter-log-events` (jika Insights/`StartQuery` diblokir IAM).
   - Buat agregasi (counting/stats) menggunakan script Python di sisi klien berdasarkan raw output dari CloudWatch.

2. **Architectural Tracing (Korelasi Lintas Layanan):**
   - Temukan ID Request atau identifier unik dari log entry-point (Gateway/CNDS).
   - Lacak request id yang sama ke downstream (FE -> Gateway -> Middleware -> Backend ECS -> DB).
   - Cek Secrets Manager jika ada konfigurasi yang di-load saat runtime (`SecretStorage.syncSecret()`).

3. **Deep 5-Whys (hingga Mentok):**
   - Implementasikan *Recursive RCA*. Jangan berhenti di "NullReferenceException" atau "DB Timeout".
   - Tanyakan *"Kenapa ini terjadi?"* terus menerus (5 hingga 20 iterasi) sampai akar paling dasar ditemukan (e.g. data corrupt di row tertentu, mismatch tipe data, memory leak karena reference cycle).
   - Terapkan ke *surrounding apps* jika root cause berada di luar batas service saat ini.

4. **Timeline & Statistics Construction:**
   - Rekonstruksi timeline dari detik ke detik. Kapan mulai anomali, puncak load, dan kegagalan total.

5. **Visual Sequence Generation:**
   - Hasilkan Sequence Diagram Mermaid berdasarkan trace yang valid.

## Referensi & Template yang Tersedia

- Baca `references/investigation-playbook.md` untuk langkah teknis spesifik AWS/ECS Kairos.
- Baca `references/5-whys-framework.md` untuk metodologi interogasi root-cause.
- Baca `assets/rca-template.md` untuk format output akhir yang diharapkan.

## Instruksi Eksekusi

Bila user meminta investigasi, mulai kumpulkan log, bangun *5-whys chain*, dan panggil `assets/rca-template.md` untuk men-generate laporan akhir.
