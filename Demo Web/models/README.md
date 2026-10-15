# Model Artifacts Directory

Letakkan file weights dan scaler di folder ini:

1. `conformer_model.pth` — PyTorch state_dict dari TabularConformer yang telah di-training.
2. `scaler.pkl` — StandardScaler hasil fit training set (disimpan dengan `joblib.dump`).
3. `config.json` — Konfigurasi arsitektur TabularConformer dan mapping target.

> Catatan: Backend FastAPI akan mendeteksi secara otomatis jika `conformer_model.pth` dan `scaler.pkl` sudah diletakkan di folder ini. Jika file model belum tersedia, backend akan beralih ke mode simulasi cerdas terkalibrasi agar antarmuka web tetap dapat diuji.
