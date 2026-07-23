# Deep Root Cause Interrogation (Extended 5-Whys)

Ini bukan 5-Whys standar. Ini adalah interogasi forensik agresif (hingga 20 level) yang menembus error log generik untuk menemukan anomali state sistem.

## The Mentality: "Errors are Symptoms, State is the Disease"

Jangan pernah menerima *Exception Message* sebagai *Root Cause*.

**Contoh Siklus Penelusuran (The Tracing Cycle):**

1. **Symptom (Why #1):** Mengapa endpoint `/pay/checkout` timeout?
   *Temuan:* ECS logs menunjukkan koneksi ke DB RDS payment drop (Connection Timeout).
2. **Context (Why #2):** Mengapa koneksi drop?
   *Temuan:* CloudWatch metrics DB menunjukkan CPU spike 99% dan active connections maxed out.
3. **Pattern (Why #3):** Mengapa spike ini terjadi secara mendadak pukul 14:00?
   *Temuan:* Ada lonjakan transaksi dari IP spesifik (external callback gateway).
4. **Logic (Why #4):** Mengapa lonjakan webhook menyebabkan exhaust connection? Bukankah kita menggunakan connection pooling?
   *Temuan:* Nilai connection pooling di Secrets Manager (`pay-pool`) di-set terlalu kecil untuk traffic burst, ATAU aplikasi gagal men-dispose/menutup koneksi di block error handler tertentu.
5. **Code Trigger (Why #5):** Di block mana aplikasi gagal men-dispose koneksi?
   *Temuan:* Saat validasi signature webhook gagal, return path mengeksekusi `throw` sebelum statement `db.Release()` dijalankan.
6. **Triggering Data (Why #6):** Mengapa validasi signature webhook ini tiba-tiba gagal secara massal?
   *Temuan:* Provider payment baru saja mengubah payload casing (huruf besar/kecil) tanpa pengumuman, mematahkan fungsi hash lokal.

**Root Cause Sejati:** Perubahan struktur payload 3rd party menyebabkan exception massal yang logic error handler-nya membocorkan (leak) DB connections.

## Teknik Penerapan

Saat menulis laporan RCA, bangun secara eksplisit urutan `Why 1 -> Why N` ini, pastikan rantainya masuk akal secara logis dan terbukti secara data forensik dari log (bukan spekulasi). Terus telusuri sampai menabrak dinding (e.g. infrastruktur eksternal/3rd party yang tidak dapat diamati, atau bug compiler/OS).
