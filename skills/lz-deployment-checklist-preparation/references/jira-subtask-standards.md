# Jira Subtask Standards & Custom Fields Reference

Dokumentasi standar penamaan tiket, pemetaan custom fields Jira, dan aturan pembuatan subtask development untuk Deployment Production.

---

## 1. Konvensi Penamaan Title (Summary)

Pola penamaan wajib seragam dan konsisten untuk memastikan keterbacaan di board, backlog, dan Jira filters:

| Tipe Tiket | Format Penamaan Standar | Contoh |
| :--- | :--- | :--- |
| **Parent Story** | `[Deployment Production][<DD Month YYYY>] <Features / Scope>` | `[Deployment Production][24 September 2026] ACL Matrix, Refund Approval History, Cancel Invoice Validation` |
| **Checklist Subtask** | `[Deployment Production][<DD Month YYYY>] Checklist - <Features / Scope>` | `[Deployment Production][24 September 2026] Checklist - ACL Matrix, Refund Approval History, Cancel Invoice Validation` |
| **Preparation Subtask** | `[Deployment Production][<DD Month YYYY>] Deployment Preparation - <Features / Scope>` | `[Deployment Production][24 September 2026] Deployment Preparation - ACL Matrix, Refund Approval History, Cancel Invoice Validation` |

---

## 2. Mandatory Custom Fields (Subtask Development)

Setiap pembuatan tiket berjenis `Subtask Development` (ID: `10013`) pada project Kairos wajib menyertakan custom fields berikut agar tidak ditolak oleh Jira validator API:

| Field Name | Custom Field ID | Tipe | Contoh Payload API | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **Tribe.** | `customfield_10136` | Array of Options | `[{"id": "10138"}]` | ID 10138 = "PAS", ID 10137 = "Corp Function", ID 10372 = "AI" |
| **Start date** | `customfield_10015` | Date (`YYYY-MM-DD`) | `"2026-09-17"` | Tanggal inisiasi / sprint start |
| **Expected Finish Date**| `customfield_10203` | Date (`YYYY-MM-DD`) | `"2026-09-24"` | Tanggal target rilis deployment |
| **Task Category** | `customfield_10201` | Option Object | `{"id": "10379"}` | ID 10379 = "Product", ID 10383 = "BAU" |
| **Mandays Estimation** | `customfield_10279` | Number | `1` | Default 1 manday |

---

## 3. Struktur Tabel Deskripsi Checklist

### A. Tabel Stories
* **Jumlah Kolom:** 1 Kolom (`Story`).
* **Format Tautan:** Inline Smart Card (`data-card-appearance="inline"`).
* **Alasan:** Menghindari redundansi penulisan summary dan status manual, Jira otomatis menampilkan chip interaktif dengan key, summary, dan status lozenge.

```html
<details>
  <summary>Stories</summary>
  <table>
    <thead><tr><th><p>Story</p></th></tr></thead>
    <tbody>
      <tr><td><p><a href="https://ict-siloamhospitals.atlassian.net/browse/KAIR-1280" data-card-appearance="inline">https://ict-siloamhospitals.atlassian.net/browse/KAIR-1280</a></p></td></tr>
    </tbody>
  </table>
</details>
```

### B. Tabel PR & Release
* **Kolom:** `Story` | `PR Preprod` | `PR Prod` | `Release Draft` | `Sonar`.
* **Catatan:** Kolom `Service Name` ditiadakan untuk menjaga kerapian awal; developer / lead akan mengisi PR & Release saat build pipeline berjalan.
* **Format Tautan:** `Story` diisi dengan tautan inline card (`data-card-appearance="inline"`).

---

## 4. Subtask Deployment Preparation
* Dibuat terpisah per assignee (misal: Frontend Developer, Backend Developer, QA, Lead).
* **Deskripsi:** Kosong / None (`""`). Tidak memerlukan deskripsi checklist ganda agar fokus checklist terpusat pada tiket Checklist utama.
* **Output:** Diberikan dalam bentuk rumus spreadsheet Excel/Sheets:
  ```excel
  =HYPERLINK("https://ict-siloamhospitals.atlassian.net/browse/KEY"; "KEY")
  ```
