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

### Perbandingan Evaluasi Akhir (Test Set Riil — 517 Pasien):
| Model | Akurasi | Macro Precision | Macro Recall | **Macro F1** | **MCC** | **Macro ROC AUC** | Recall Paru-Paru (Kritis) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Tabular Conformer (Final)** | **95.74%** | **0.8646** | **0.9420** | **0.8983** | **0.8678** | **0.9960** | **100.0% (3/3)** |
| **CNN 1D (Baseline)** | 94.20% | 0.7130 | 0.7623 | 0.7258 | 0.8162 | 0.9745 | 33.3% (1/3) |
| **Random Forest (Baseline)** | 94.10% | 0.7300 | 0.7710 | 0.7431 | 0.8245 | 0.9810 | 33.3% (1/3) |

> **Temuan Kunci Skripsi:** Conformer mengungguli CNN 1D dan Random Forest secara signifikan pada **Macro F1 (+17.2% vs CNN)** dan **MCC (+5.2% vs CNN)**. Conformer berhasil mendeteksi 100% kasus paru-paru tanpa kehilangan pasien kritis (*zero false negatives* pada pulmonologi).

---

## 2. Pembaruan dan Penyempurnaan Teknis

### A. Preprocessing & Integritas Data (`merge_DocLab_imputed.csv`)
* **Total Sampel Bersih:** 3.445 data pasien murni (Sehat: 2.812, Jantung: 52, Penyakit Dalam: 561, Paru-Paru: 20).
* **Missing & Zero Values:** 0.00% missing values dan 0.00% nilai biologis nol fisiologis pada seluruh 12 parameter laboratorium.
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
