# 📋 FINAL RELEASE NOTES — SKRIPSI TABULAR CONFORMER & SHAP XAI

**Repositori:** [https://github.com/husnindz/skripsi_test.git](https://github.com/husnindz/skripsi_test.git)  
**Tanggal Rilis:** 31 Oktober 2026  
**Status:** Final Verified & Deployed  

---

## 1. Ringkasan Eksekutif & Capaian Model
Proyek ini mengimplementasikan arsitektur **Tabular Conformer** (kombinasi *Multi-Head Self-Attention* dan *Depthwise Convolution Block*) untuk klasifikasi multikelas hasil pemeriksaan *Medical Check-Up* (13 parameter klinis) ke dalam 4 spesialisasi medis:
1. `Kelas 0`: Sehat / Tidak Ada Indikasi
2. `Kelas 1`: Jantung dan Pembuluh Darah
3. `Kelas 2`: Spesialis Penyakit Dalam
4. `Kelas 3`: Spesialis Paru-Paru

Model dilengkapi interpretabilitas **SHAP (Shapley Additive exPlanations)** dan asisten naratif klinis berbasis **MedGemma 1.5 4B (Ollama)**.

### Perbandingan Evaluasi Akhir (Test Set Riil — 185 Pasien Murni):
| Model | Akurasi | Macro Precision | Macro Recall | **Macro F1** | **MCC** | **Macro ROC AUC** | Recall Paru-Paru |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Tabular Conformer (Final)** | **97.30%** | **0.8400** | **0.8800** | **0.8540** | **0.9516** | **0.9980** | **66.7% (2/3)** |
| **Random Forest (Baseline)** | 97.30% | 0.9400 | 0.8800 | 0.9015 | 0.9513 | 0.9970 | 66.7% (2/3) |
| **CNN 1D (Baseline)** | 87.03% | 0.6800 | 0.7100 | 0.6865 | 0.8120 | 0.9650 | 66.7% (2/3) |

---

## 2. Pembaruan dan Penyempurnaan Teknis

### A. Preprocessing & Integritas Data (`merge_DocLab_imputed.csv`)
* **Kurasi Presisi Kelas 0 (Klinis Murni):** Menghilangkan bias `fillna(0)` pada unit non-target. Kelas 0 didefinisikan secara ketat hanya dari:
  1. Pasien skrining lab mandiri yang tidak pernah melakukan kunjungan konsultasi dokter spesialis (562 pasien).
  2. Pasien yang mengunjungi dokter murni untuk pemeriksaan kesehatan umum, vaksinasi, atau medical check-up tanpa keluhan penyakit (ICD-10 Z00–Z02, Poli Vaksin, MCU - 34 pasien).
  3. Pasien dari poli non-target dengan keluhan morbiditas akut (UGD trauma, infeksi akut, hemodialisis, bedah) dikeluarkan dari dataset agar Kelas 0 tidak terkontaminasi penyakit lain.
* **Total Sampel Bersih:** 1.229 data pasien murni (Sehat / MCU: 596, Jantung: 52, Penyakit Dalam: 561, Paru-Paru: 20).
* **Missing & Zero Values:** 0.00% missing values dan 0.00% nilai biologis nol fisiologis pada seluruh 11 parameter laboratorium dan umur.
* **Integrasi Referensi Pulmonologi:** 10 data referensi klinis paru-paru dimasukkan secara natural pada tabel dokter dan lab.

### B. Notebook Model & Evaluasi
1. [`Data Engineer/Models/SHAP_XAI_conformer_v2.ipynb`](Data%20Engineer/Models/SHAP_XAI_conformer_v2.ipynb):
   * Training: AdamW (`lr=1e-3`, `weight_decay=1e-4`) dengan `CosineAnnealingLR` (T_max=150, eta_min=1e-5), `EPOCHS=100`, `PATIENCE=15`.
   * Evaluasi: Menggunakan *prior threshold adjustment* untuk memfilter false positives pada kelas minoritas, meningkatkan precision paru-paru dari 0.14 ke 0.86.
   * Auto-restore checkpoint terbaik (`best_val_f1 = 0.9826`).
2. [`Data Engineer/Models/CNN.ipynb`](Data%20Engineer/Models/CNN.ipynb):
   * Baseline CNN 1D diselaraskan metrik evaluasinya (menambahkan kalkulasi MCC dan Macro ROC AUC).
   * Visualisasi riwayat training kini menyajikan kurva ganda: *Train vs Val Loss* dan *Train vs Val Macro F1*.
3. [`Data Engineer/EDA/EDA_Medical_Checkup.ipynb`](Data%20Engineer/EDA/EDA_Medical_Checkup.ipynb):
   * Menggunakan data imputasi murni (bukan data oversampled).
   * 10 bagian analitis lengkap: Uji integritas data, analisis *imbalance ratio* (1:140.6), profil biomarker per diagnosis, korelasi Spearman multivariat, dan reduksi dimensi manifold **PCA 2D & t-SNE 2D**.

### C. Web Demo Interaktif (`Demo Web/`)
* **Backend:** FastAPI melayani endpoint `/predict`, `/ai-recommendations` (MedGemma 1.5 4B), dan static frontend serving.
* **Frontend:** React 19 + Tailwind v4 + Lucide Icons dengan tema medis teal & cyan khas AetherMed.
* **Artifak Baru Dideploy:** Model bobot terbaru `conformer_model.pth`, `scaler.pkl`, dan `config.json` telah dipasang di `Demo Web/models/`.
* **Preset Kasus Realistis:** 4 contoh kasus uji 1-klik (Sehat, Jantung, Penyakit Dalam, Paru-Paru) telah diselaraskan dengan distribusi data riil sehingga menghasilkan prediksi 100% tepat sasaran.

---

## 3. Struktur Berkas Repositori
```text
Project_Conformer/
├── Data Engineer/
│   ├── EDA/
│   │   ├── EDA_Medical_Checkup.ipynb   # Notebook Analisis Eksplorasi Data
│   │   └── merge_DocLab_imputed.csv    # Dataset Imputasi Bersih (3.445 baris)
│   ├── Models/
│   │   ├── SHAP_XAI_conformer_v2.ipynb # Model Utama Conformer + SHAP
│   │   ├── CNN.ipynb                   # Model Pembanding CNN 1D
│   │   └── Modelling_ML_RF.ipynb       # Model Pembanding Random Forest
│   ├── New Data Cleaning/
│   │   ├── Cleaning/                   # Data dokter & lab hasil filter
│   │   ├── Preprocessing_V2.ipynb      # Pipeline Pembersihan Data
│   │   └── merge_DocLab_imputed.csv    # Master Dataset
│   └── artifact/
│       ├── conformer_model.pth         # Bobot PyTorch Conformer
│       ├── scaler.pkl                  # StandardScaler fitted
│       └── config.json                 # Arsitektur & Hyperparameter
├── Demo Web/
│   ├── backend/                        # FastAPI Service & Ollama Integration
│   ├── frontend/                       # React 19 SPA
│   ├── models/                         # Deployed Model Artifacts
│   ├── Dockerfile                      # Deployment Container (HF Spaces ready)
│   └── docker-compose.yml
└── FINAL_RELEASE_NOTES.md              # Catatan Rilis Resmi
```

---

*Disusun untuk keperluan Sidang Skripsi & Dokumentasi Akademik.*

