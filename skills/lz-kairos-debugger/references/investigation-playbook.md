# AWS ECS & Kairos Investigation Playbook

Panduan teknis untuk mengeksekusi operasi forensik di infrastruktur Kairos AWS ECS.

## 1. CloudWatch Log Extraction (Fallback Pattern)

Seringkali `StartQuery` (Insights) diblokir oleh IAM role (`his-prod-runner`). Gunakan pattern `filter-log-events` untuk stream log secara efisien:

```bash
# Basic extraction dengan pagination
aws logs filter-log-events \
  --log-group-name "/ecs/kairos-pas-cluster-ecs-iac" \
  --filter-pattern "ERROR" \
  --start-time <epoch_ms> --end-time <epoch_ms> \
  --max-items 100 \
  --profile kairos-production --region ap-southeast-3
```

*Scripting tip*: Untuk analitik/statistik, pipe output ini ke skrip python lokal yang membaca JSON per-line, mem-parsing timestamp, dan menghitung kemunculan error per menit/jam.

## 2. ECS Container Constraints

- Container HIS (`his-*-iac`) **TIDAK** memiliki SSM agent terinstall. Perintah `aws ecs execute-command` (exec/shell) akan selalu gagal dengan `TargetNotConnectedException`.
- **Solusi:** Jangan buang waktu mencoba exec ke HIS. Selalu bergantung pada CloudWatch logs dan local/VPN cURL ke internal ALB/IP target.

## 3. Configuration & Secrets Gotcha

- Konfigurasi Kairos di-load saat runtime via AWS Secrets Manager (via `SecretStorage.syncSecret()`).
- JANGAN asumsikan nilai pool size, timeout, atau credential dari *source code default* atau Task Definition `.env`.
- Verifikasi nilai asli dengan:

  ```bash
  aws secretsmanager get-secret-value --secret-id <secret-name> --profile <profile>
  ```

## 4. Middleware & Signature Tracing

- Kegagalan integrasi CNDS/Gateway (misal mismatch signature) biasanya tersembunyi di perbedaan middleware UAT vs Local Proxy.
- Cari log dengan tag `LOG>>` di backend untuk mendapatkan nilai signature (contoh: C# `BigInteger.ToString("X")`).
- Bandingkan string mentah ini langsung dengan kalkulasi JS di Frontend. (Masalah umum: missing leading zero e.g., `0E78...` vs `E78...`).
