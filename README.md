# Project Conformer XAI: Medical Check-Up Clinical Decision Support System

Repositori skripsi sistem skrining kesehatan berkala berbasis **Tabular Conformer Deep Learning**, **SHAP (Shapley Additive exPlanations)**, dan **MedGemma 1.5 4B (Explainable AI Clinical Narrative)**.

---

## Struktur Repositori

```text
Project_Conformer/
├── Data Engineer/                     # Pipeline pembersihan, pemodelan, dan eksperimen
│   ├── Base Cleaning/                 # Notebook pembersihan data laboratorium & dokter
│   │   ├── Cleaning Doctor.ipynb
│   │   ├── Cleaning LAB.ipynb
│   │   ├── Hybrid Oversampling.ipynb
│   │   ├── Preprocessing.ipynb
│   │   └── Test syntethic.ipynb
│   ├── Models/                        # Riset model machine learning & Conformer XAI
│   │   ├── EDA_Medical_Checkup.ipynb
│   │   ├── Modelling ML RF.ipynb
│   │   ├── conformer_v1.ipynb
│   │   ├── SHAP_XAI_conformer_v2.ipynb # Notebook utama Conformer v2 + SHAP (max_evals=270)
│   │   ├── merge_DocLab_balanced.csv
│   │   └── merge_DocLab_hybrid.csv
│   └── artifact/                      # Output model weights, scaler, dan config
│       ├── conformer_model.pth        # PyTorch model state_dict
│       ├── scaler.pkl                 # StandardScaler fitted parameters
│       └── config.json                # Hyperparameter model (dim=64, heads=4, conv_kernel=3)
│
└── Demo Web/                          # Aplikasi Web Interaktif Monorepo (AetherMed)
    ├── backend/                       # FastAPI Backend
    │   ├── app/
    │   │   ├── main.py                # REST API (/predict, /ai-recommendations, /health)
    │   │   ├── model.py               # TabularConformer PyTorch Architecture
    │   │   ├── explainer.py           # SHAP PermutationExplainer (max_evals=270)
    │   │   ├── ollama_service.py      # Integrasi MedGemma 1.5 4B XAI Narrative
    │   │   ├── preprocessing.py       # Scaler loader & feature alignment
    │   │   └── schemas.py             # Pydantic Request & Response models
    │   └── requirements.txt
    ├── frontend/                      # React 19 + Tailwind CSS + Vite
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── PatientForm.jsx    # Input 13 parameter klinis & preset pasien
    │   │   │   ├── PredictionResult.jsx # Visualisasi probabilitas 4 kelas
    │   │   │   ├── ShapChart.jsx      # Grafik kontribusi fitur SHAP (mendorong/menurunkan)
    │   │   │   ├── RecommendationBoxes.jsx # Narasi klinis MedGemma + badge engine
    │   │   │   └── ParametersTable.jsx # Nilai rujukan normal laboratorium
    │   │   └── App.jsx
    │   └── package.json
    └── models/                        # Production weights mirror
        ├── conformer_model.pth
        ├── scaler.pkl
        └── config.json
```

---

## 13 Parameter Laboratorium
1. `JENIS_KELAMIN` (0: Laki-laki, 1: Perempuan)
2. `UMUR_TAHUN` (Tahun)
3. `cholesterol total` (mg/dL)
4. `creatinin` (mg/dL)
5. `fbs` - Fasting Blood Sugar (mg/dL)
6. `rbs` - Random Blood Sugar (mg/dL)
7. `hgb` - Hemoglobin (g/dL)
8. `lymfosit%` (%)
9. `mch` (pg)
10. `mchc` (g/dL)
11. `mcv` (fL)
12. `ureum` (mg/dL)
13. `wbc` - White Blood Cells ($10^3$/µL)

## 4 Kelas Diagnosa Skrining
- `0`: Sehat / Tidak Ada Indikasi Patologis Signifikan
- `1`: Jantung dan Pembuluh Darah (Kardiovaskular)
- `2`: Spesialis Penyakit Dalam (Metabolik & Ginjal)
- `3`: Spesialis Paru-Paru (Respiratorik & Inflamasi)

---

## Explainable AI (XAI) Pipeline
1. **Conformer Forward**: Menghitung probabilitas 4 kelas menggunakan representasi self-attention + depthwise convolution.
2. **SHAP Permutation Explainer**: Menghitung atribusi kontribusi fitur dengan `max_evals=270` (10 siklus evaluasi permutasi).
3. **MedGemma 1.5 4B**: Menerjemahkan data pasien dan top fitur SHAP menjadi narasi rekomendasi klinis terstruktur (Tindakan Medis, Pola Makan, Gaya Hidup).
