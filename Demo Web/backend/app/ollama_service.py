import os
import json
import logging
from typing import Dict, Any, List, Optional
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
DEFAULT_TIMEOUT_SEC = int(os.getenv("OLLAMA_TIMEOUT_SEC", "90"))
CONFIGURED_OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "").strip()

# Strict MedGemma model identifiers (rejects generic non-medical LLMs)
ALLOWED_MEDGEMMA_MODELS = [
    "medgemma1.5:4b",
    "dcarrascosa/medgemma-1.5-4b-it",
    "medgemma",
]

# Authoritative Clinical Reference Ranges (synchronized with ParametersTable.jsx & synthetic reference guidelines)
# Sources:
# [1] ACC/AHA Guidelines — Cardiovascular Risk (2019)
# [2] ADA Standards of Medical Care in Diabetes (2023)
# [3] KDIGO Clinical Practice Guideline for CKD (2022)
# [4] WHO — Haemoglobin concentrations for anaemia diagnosis (2011)
# [5] Fauci et al., Harrison's Principles of Internal Medicine
LAB_REFERENCES = {
    "cholesterol total": {
        "min": 0.0,
        "max": 200.0,
        "unit": "mg/dL",
        "name": "Cholesterol Total",
        "source": "ACC/AHA Guidelines (2019)",
    },
    "creatinin": {
        "min": 0.6,
        "max": 1.1,
        "unit": "mg/dL",
        "name": "Creatinin",
        "source": "KDIGO CKD Guidelines (2022)",
    },
    "fbs": {
        "min": 70.0,
        "max": 100.0,
        "unit": "mg/dL",
        "name": "FBS (Gula Darah Puasa)",
        "source": "ADA Standards of Care in Diabetes (2023)",
    },
    "rbs": {
        "min": 70.0,
        "max": 110.0,
        "unit": "mg/dL",
        "name": "RBS (Gula Darah Sewaktu)",
        "source": "ADA Standards of Care in Diabetes (2023)",
    },
    "hgb": {
        "min": 12.0,
        "max": 16.0,
        "unit": "g/dL",
        "name": "Hgb (Hemoglobin)",
        "source": "WHO Haemoglobin Concentrations (2011)",
    },
    "lymfosit%": {
        "min": 20.0,
        "max": 35.0,
        "unit": "%",
        "name": "Lymfosit %",
        "source": "Harrison's Principles of Internal Medicine",
    },
    "mch": {
        "min": 27.0,
        "max": 34.0,
        "unit": "pg",
        "name": "MCH",
        "source": "Harrison's Principles of Internal Medicine",
    },
    "mchc": {
        "min": 32.0,
        "max": 36.0,
        "unit": "g/dL",
        "name": "MCHC",
        "source": "Harrison's Principles of Internal Medicine",
    },
    "mcv": {
        "min": 80.0,
        "max": 100.0,
        "unit": "fL",
        "name": "MCV",
        "source": "Harrison's Principles of Internal Medicine",
    },
    "ureum": {
        "min": 17.0,
        "max": 43.0,
        "unit": "mg/dL",
        "name": "Ureum",
        "source": "KDIGO (2022) & Data Statistik Klinis",
    },
    "wbc": {
        "min": 4.0,
        "max": 11.0,
        "unit": "10³/µL",
        "name": "WBC (Leukosit)",
        "source": "Harrison's Principles of Internal Medicine",
    },
}


def get_available_ollama_model() -> Optional[str]:
    """
    Check running Ollama instance and return MedGemma model name.
    Strictly verifies MedGemma variants. If not installed or Ollama is offline,
    returns None to trigger transparent rule-based screening fallback
    instead of silently falling back to a non-medical LLM.
    """
    if CONFIGURED_OLLAMA_MODEL:
        return CONFIGURED_OLLAMA_MODEL

    try:
        req = urllib.request.Request(f"{OLLAMA_BASE_URL}/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=3) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                models = [m.get("name", "") for m in data.get("models", [])]

                for preferred in ALLOWED_MEDGEMMA_MODELS:
                    for installed in models:
                        if preferred in installed:
                            return installed
                logger.info(
                    "MedGemma not found in Ollama (installed: %s). Using rule-based fallback.",
                    models,
                )
    except Exception as e:
        logger.debug("Ollama service not reachable at %s: %s", OLLAMA_BASE_URL, e)
    return None


def generate_fallback_rules(
    class_id: int,
    class_name: str,
    top_drivers: List[str],
) -> Dict[str, Any]:
    """
    Deterministic clinical rule-based screening recommendations (offline fallback).
    Framed responsibly as screening decision support, not definitive medical claims.
    """
    clean_name = class_name.replace("Spes. ", "")
    drivers_str = " dan ".join(top_drivers) if top_drivers else "parameter laboratorium terkait"

    if class_id == 1:
        summary = (
            f"Model mendeteksi indikasi kecenderungan risiko kardiovaskular ({clean_name}). "
            f"Analisis atribusi SHAP menunjukkan parameter {drivers_str} merupakan faktor pendorong "
            f"terbesar dalam prediksi ini. Disarankan melakukan konfirmasi klinis dengan dokter spesialis jantung."
        )
        recommendations = [
            {
                "label": "Tindakan Medis",
                "text": "Konsultasikan hasil skrining dengan Dokter Spesialis Jantung (Sp.JP) untuk evaluasi elektrokardiogram (EKG) atau profil lipid berkala.",
            },
            {
                "label": "Pola Makan",
                "text": "Batasi asupan lemak jenuh, santan, makanan bergaram tinggi, dan perbanyak serat dari sayuran dan buah segar.",
            },
            {
                "label": "Gaya Hidup",
                "text": "Jaga rutinitas istirahat 7-8 jam per hari, hindari stres berlebih, serta lakukan aktivitas fisik aerobik ringan secara teratur.",
            },
        ]
    elif class_id == 2:
        summary = (
            f"Model mendeteksi indikasi kecenderungan risiko metabolik/ginjal ({clean_name}). "
            f"Parameter {drivers_str} teridentifikasi sebagai kontributor utama peningkatan probabilitas pada model Conformer. "
            f"Perlu dilakukan pemeriksaan laboratorium penunjang lanjutan."
        )
        recommendations = [
            {
                "label": "Tindakan Medis",
                "text": "Konsultasikan hasil dengan Dokter Spesialis Penyakit Dalam (Sp.PD) untuk pemeriksaan lanjutan fungsi ginjal dan evaluasi HbA1c.",
            },
            {
                "label": "Pola Makan",
                "text": "Kurangi konsumsi gula sederhana, batasi karbohidrat olahan tinggi, serta cukupi kebutuhan cairan minimal 2 liter per hari sesuai anjuran medis.",
            },
            {
                "label": "Gaya Hidup",
                "text": "Lakukan pemantauan mandiri terhadap tekanan darah dan kadar gula darah secara berkala di rumah.",
            },
        ]
    elif class_id == 3:
        summary = (
            f"Model mendeteksi pola yang mengarah ke perhatian sistem pernapasan ({clean_name}). "
            f"Berdasarkan SHAP, parameter profil darah {drivers_str} menjadi kontributor utama yang mendorong klasifikasi ini. "
            f"Pemeriksaan saluran pernapasan dianjurkan bila terdapat keluhan respiratorik."
        )
        recommendations = [
            {
                "label": "Tindakan Medis",
                "text": "Konsultasikan dengan Dokter Spesialis Paru (Sp.P) untuk pemeriksaan fisik dada atau Rontgen toraks jika ada keluhan batuk/sesak.",
            },
            {
                "label": "Pola Makan",
                "text": "Tingkatkan konsumsi makanan kaya antioksidan (vitamin C dan D) serta protein berkualitas untuk mendukung daya tahan tubuh.",
            },
            {
                "label": "Gaya Hidup",
                "text": "Hindari paparan asap rokok, polusi udara, dan debu; gunakan masker pelindung saat beraktivitas di luar ruangan.",
            },
        ]
    else:
        summary = (
            "Model mendeteksi seluruh parameter profil laboratorium pasien secara umum berada "
            "dalam rentang seimbang tanpa adanya indikasi patologis signifikan pada keempat kategori skrining."
        )
        recommendations = [
            {
                "label": "Tindakan Medis",
                "text": "Pertahankan jadwal pemeriksaan kesehatan berkala (medical check-up) setidaknya satu tahun sekali untuk pemantauan preventif.",
            },
            {
                "label": "Pola Makan",
                "text": "Pertahankan pola makan bergizi seimbang dengan mencukupi kebutuhan serat, sayuran, dan protein tanpa lemak.",
            },
            {
                "label": "Gaya Hidup",
                "text": "Pertahankan kebiasaan berolahraga teratur 150 menit per minggu, tidur cukup, dan kelola stres dengan baik.",
            },
        ]

    return {
        "status": "success",
        "engine": "rule-based",
        "ai_summary": summary,
        "recommendations": recommendations,
    }


def _extract_field(data: Dict[str, Any], candidates: List[str], default_val: str = "") -> str:
    """Extract string value matching case-insensitive candidate keys."""
    for key in candidates:
        if key in data and isinstance(data[key], str) and data[key].strip():
            return data[key].strip()
    for k, v in data.items():
        if any(c.lower() in k.lower() for c in candidates) and isinstance(v, str) and v.strip():
            return v.strip()
    return default_val


def _parse_ollama_json(response_text: str, fallback: Dict[str, Any], model_name: str) -> Dict[str, Any]:
    """Parse JSON with fallback to regex extraction if JSON is cut off or unclosed."""
    import re
    parsed: Dict[str, Any] = {}
    try:
        json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group(0))
        else:
            parsed = json.loads(response_text)
    except Exception:
        # Fallback regex extraction for fields even if output is partially cut off
        for field, patterns in [
            ("ai_summary", [r'"ai_summary"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)']),
            ("tindakan_medis", [r'"tindakan_medis"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)', r'"tindakan"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)']),
            ("pola_makan", [r'"pola_makan"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)', r'"diet"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)']),
            ("gaya_hidup", [r'"gaya_hidup"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)', r'"aktivitas"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)']),
        ]:
            for pat in patterns:
                m = re.search(pat, response_text)
                if m:
                    parsed[field] = m.group(1).replace(r'\"', '"').strip()
                    break

    ai_summary = _extract_field(
        parsed,
        ["ai_summary", "summary", "ringkasan", "analisis"],
        fallback["ai_summary"],
    )
    tindakan = _extract_field(
        parsed,
        ["tindakan_medis", "tindakan", "medis", "medical_action"],
        fallback["recommendations"][0]["text"],
    )
    makan = _extract_field(
        parsed,
        ["pola_makan", "diet", "nutrisi", "makanan"],
        fallback["recommendations"][1]["text"],
    )
    hidup = _extract_field(
        parsed,
        ["gaya_hidup", "aktivitas", "lifestyle", "kebiasaan"],
        fallback["recommendations"][2]["text"],
    )

    if ai_summary:
        return {
            "status": "success",
            "engine": model_name,
            "ai_summary": ai_summary,
            "recommendations": [
                {"label": "Tindakan Medis", "text": tindakan},
                {"label": "Pola Makan", "text": makan},
                {"label": "Gaya Hidup", "text": hidup},
            ],
        }
    return fallback


def generate_clinical_narrative(
    patient_data: Dict[str, float],
    predicted_class_id: int,
    predicted_class_name: str,
    probability: float,
    top_shap_features: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Generate natural medical summary & recommendations using MedGemma 1.5 4B via Ollama.
    Incorporates:
    - Accurate class-aware SHAP semantics (distinguishing normal stabilizers vs risk drivers).
    - Standardized clinical laboratory reference ranges.
    - Non-assertive decision-support framing with automatic rule-based fallback.
    """
    clean_class_name = predicted_class_name.replace("Spes. ", "")
    top_pos_drivers = [
        f.get("feature", "") for f in top_shap_features if f.get("shap", 0) > 0
    ][:2]

    fallback = generate_fallback_rules(predicted_class_id, predicted_class_name, top_pos_drivers)

    model_name = get_available_ollama_model()
    if not model_name:
        logger.info("MedGemma not found or Ollama unreachable. Using verified rule-based screening engine.")
        return fallback

    gender_str = "Laki-laki" if patient_data.get("JENIS_KELAMIN", 0) == 0 else "Perempuan"
    age_str = str(int(patient_data.get("UMUR_TAHUN", 0)))

    # Identify abnormal parameters based on synchronized clinical references
    abnormal_notes = []
    for feat_key, val in patient_data.items():
        if feat_key in LAB_REFERENCES:
            ref = LAB_REFERENCES[feat_key]
            if val < ref["min"]:
                abnormal_notes.append(
                    f"- {ref['name']}: {val} {ref['unit']} [DI BAWAH NORMAL, rujukan: {ref['min']}-{ref['max']} {ref['unit']}]"
                )
            elif val > ref["max"]:
                abnormal_notes.append(
                    f"- {ref['name']}: {val} {ref['unit']} [DI ATAS NORMAL, rujukan: {ref['min']}-{ref['max']} {ref['unit']}]"
                )

    abnormal_text = "\n".join(abnormal_notes) if abnormal_notes else "- Seluruh parameter dalam rentang referensi normal."

    # Class-aware SHAP semantics:
    # - Class 0 (Normal): Positive SHAP = supports normal status. Negative SHAP = reduces normal confidence.
    # - Class 1-3 (Pathological): Positive SHAP = pushes toward pathology. Negative SHAP = restrains pathology.
    if predicted_class_id == 0:
        shap_pos_lines = [
            f"- Parameter {f.get('feature')}: SHAP +{f.get('shap', 0):.4f} (indikator penopang kondisi normal/sehat)"
            for f in top_shap_features if f.get("shap", 0) > 0
        ][:3]
        shap_neg_lines = [
            f"- Parameter {f.get('feature')}: SHAP {f.get('shap', 0):.4f} (parameter yang sedikit mengurangi probabilitas normal)"
            for f in top_shap_features if f.get("shap", 0) < 0
        ][:2]
        shap_role_title = "Faktor Penopang Kondisi Normal/Sehat (SHAP)"
        clinical_context_instruction = (
            "Model memprediksi profil pasien berada dalam rentang NORMAL/SEHAT. "
            "Jelaskan bahwa parameter SHAP positif mencerminkan indikator biologis yang menjaga kondisi sehat pasien."
        )
    else:
        shap_pos_lines = [
            f"- Parameter {f.get('feature')}: SHAP +{f.get('shap', 0):.4f} (faktor pendorong utama prediksi ke arah {clean_class_name})"
            for f in top_shap_features if f.get("shap", 0) > 0
        ][:3]
        shap_neg_lines = [
            f"- Parameter {f.get('feature')}: SHAP {f.get('shap', 0):.4f} (parameter dalam batas aman yang menahan/menurunkan prediksi {clean_class_name})"
            for f in top_shap_features if f.get("shap", 0) < 0
        ][:2]
        shap_role_title = f"Faktor Pendorong Prediksi {clean_class_name} (SHAP)"
        clinical_context_instruction = (
            f"Model mendeteksi indikasi kecenderungan risiko {clean_class_name} (skrining awal). "
            "Jelaskan bahwa parameter SHAP positif adalah faktor yang paling berkontribusi mendorong model ke arah prediksi ini."
        )

    all_shap_lines = shap_pos_lines + shap_neg_lines
    shap_summary_str = "\n".join(all_shap_lines) if all_shap_lines else "- Nilai kontribusi parameter seimbang."

    prompt = f"""Anda adalah asisten AI skrining klinis AetherMed (berbasis Conformer Deep Learning + SHAP XAI).
Peran: Memberikan edukasi dan ringkasan komputasi interpretasi laboratorium untuk skrining awal, BUKAN diagnosis definitif.

Profil Pasien: {gender_str}, {age_str} tahun.
Hasil Skrining Model: {clean_class_name} (Probabilitas {probability * 100:.1f}%).
Konteks Analisis: {clinical_context_instruction}
{shap_role_title}:
{shap_summary_str}
Parameter Lab di Luar Batas Rujukan:
{abnormal_text}

Aturan Penulisan:
1. Hindari klaim diagnosis mutlak; gunakan kalimat edukatif/skrining pendukung keputusan klinis.
2. Jawab dalam format JSON murni yang sangat singkat dan padat (maksimal 1-2 kalimat per poin):
{{
  "ai_summary": "1-2 kalimat ringkas menjelaskan temuan laboratorium dan kontribusi fitur SHAP.",
  "tindakan_medis": "1 kalimat anjuran konsultasi dokter spesialis terkait atau tes konfirmasi penunjang.",
  "pola_makan": "1 kalimat anjuran nutrisi atau pembatasan makanan spesifik.",
  "gaya_hidup": "1 kalimat anjuran aktivitas fisik atau pemantauan kesehatan mandiri."
}}"""

    payload = {
        "model": model_name,
        "prompt": prompt,
        "format": "json",
        "stream": False,
        "keep_alive": "30m",
        "options": {
            "num_gpu": 0,
            "num_thread": 8,
            "temperature": 0.1,
            "num_predict": 240,
        },
    }

    try:
        req = urllib.request.Request(
            f"{OLLAMA_BASE_URL}/api/generate",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=DEFAULT_TIMEOUT_SEC) as resp:
            if resp.status == 200:
                resp_data = json.loads(resp.read().decode("utf-8"))
                response_text = resp_data.get("response", "").strip()
                return _parse_ollama_json(response_text, fallback, model_name)
    except Exception as e:
        logger.warning("Failed to query Ollama model %s: %s. Using rule fallback.", model_name, e)

    return fallback

