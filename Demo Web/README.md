# AetherMed — Medical Check-up Conformer XAI Demo

Web demo interaktif untuk skrining risiko kesehatan berdasarkan hasil pemeriksaan **Medical Check-up (13 Fitur Klinis)** menggunakan model Deep Learning **Tabular Conformer** dan visualisasi interpretabilitas **SHAP (Shapley Additive exPlanations)**.

Dibangun dengan arsitektur **Monorepo** yang ringan, siap dideploy langsung ke **Hugging Face Spaces**. Desain antarmuka mengadopsi estetika medis modern dengan tema teal & cyan khas AetherMed.

---

## 📁 Struktur Monorepo

```text
Demo Web/
├── frontend/               # React 19 + Tailwind CSS v4 + Lucide React + Vite
│   ├── src/
│   │   ├── components/     # Header, MedicalForm, SamplePresets, PredictionResult, ShapChart, dll.
│   │   ├── utils/          # API client & dataset sample presets
│   │   ├── App.jsx
│   │   ├── index.css       # Theme tokens (#146178, #EDFBFF, #77F9D0, Montserrat/Jakarta Sans)
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                # FastAPI + PyTorch + Scikit-Learn + SHAP
│   ├── app/
│   │   ├── main.py         # REST API endpoints & static single-container serving
│   │   ├── schemas.py      # Validasi input & output Pydantic v2
│   │   ├── model.py        # Arsitektur TabularConformer PyTorch
│   │   ├── preprocessing.py# Urutan fitur kanonikal & standard scaler loader
│   │   └── explainer.py    # Explainer SHAP permutation & local attribution
│   ├── requirements.txt
│   └── run.py
│
├── models/                 # Tempat penyimpanan weights & scaler
│   ├── config.json         # Konfigurasi hyperparameter model Conformer
│   ├── conformer_model.pth # (Opsional / Otomatis dimuat jika tersedia)
│   ├── scaler.pkl          # (Opsional / Otomatis dimuat jika tersedia)
│   └── README.md
│
├── Dockerfile              # Multi-stage Docker siap pakai untuk Hugging Face Spaces (Port 7860)
├── docker-compose.yml      # Local container orchestration
└── README.md
```

---

## 🎯 13 Fitur Laboratorium Kanonikal

Urutan fitur (`FEATURE_ORDER`) dijaga ketat agar konsisten antara training dan inferensi:

1. `JENIS_KELAMIN` (0: Laki-laki, 1: Perempuan)
2. `UMUR_TAHUN` (Tahun)
3. `cholesterol total` (mg/dL)
4. `creatinin` (mg/dL)
5. `fbs` (mg/dL) — Fasting Blood Sugar
6. `rbs` (mg/dL) — Random Blood Sugar
7. `hgb` (g/dL) — Hemoglobin
8. `lymfosit%` (%) — Persentase Limfosit
9. `mch` (pg)
10. `mchc` (g/dL)
11. `mcv` (fL)
12. `ureum` (mg/dL)
13. `wbc` (10³/µL) — Leukosit

### 4 Kelas Target
- `0`: **Sehat / Tidak Ada Indikasi**
- `1`: **Jantung dan Pembuluh Darah**
- `2`: **Spes. Penyakit Dalam**
- `3`: **Spes. Paru-Paru**

---

## 🚀 Cara Menjalankan Secara Lokal

### 1. Menjalankan Backend (FastAPI)

```bash
cd "Demo Web/backend"

# Install dependensi Python (jika belum)
pip install -r requirements.txt

# Jalankan server API (Port 8000)
python run.py
```
Akses Swagger UI dokumentasi API di: `http://localhost:8000/docs`

### 2. Menjalankan Frontend (Vite React)

```bash
cd "Demo Web/frontend"

# Install dependensi Node.js
npm install

# Jalankan dev server (Port 5173)
npm run dev
```
Buka browser di: `http://localhost:5173`

---

## 🧠 Menambahkan Model Weights Asli (.pth & .pkl)

Backend telah dilengkapi detektor otomatis:
1. Simpan checkpoint PyTorch hasil training Anda ke `Demo Web/models/conformer_model.pth`.
2. Simpan scaler hasil fit training ke `Demo Web/models/scaler.pkl`.
3. Restart server backend.
4. Backend akan mendeteksi file tersebut dan beralih otomatis dari **Simulation Mode** ke **Active Conformer v2 PyTorch Mode** tanpa perlu mengubah kode.

---

## 🐳 Deployment ke Hugging Face Spaces

1. Buat Space baru di Hugging Face dengan memilih **SDK: Docker** (Blank Docker).
2. Clone repository Space Anda atau hubungkan ke GitHub repository ini.
3. Pastikan `Dockerfile` berada di root repository Hugging Face Spaces.
4. Deploy! Aplikasi akan otomatis di-build multi-stage dan berjalan pada port `7860`.

---

## ⚠️ Medical Disclaimer

> Aplikasi web demo ini merupakan prototipe eksperimental berbasis Machine Learning / Deep Learning. Hasil prediksi dan penjelasan kontribusi fitur SHAP berasal dari model terlatih dan **bukan merupakan diagnosis medis profesional**. Jangan gunakan sebagai pengganti konsultasi dengan dokter atau tenaga medis berwenang.
