import json
import logging
from typing import Dict, Any, List, Optional
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_TIMEOUT_SEC = 90

PREFERRED_MODELS = [
    "medgemma1.5:4b",
    "dcarrascosa/medgemma-1.5-4b-it",
    "medgemma",
    "llama3.2:3b",
]

# Clinical laboratory reference ranges for context
LAB_REFERENCES = {
    "cholesterol total": {"min": 0, "max": 200.0, "unit": "mg/dL", "name": "Kolesterol Total"},
    "creatinin": {"min": 0.5, "max": 1.2, "unit": "mg/dL", "name": "Kreatinin"},
    "fbs": {"min": 70.0, "max": 100.0, "unit": "mg/dL", "name": "Gula Darah Puasa (FBS)"},
    "rbs": {"min": 70.0, "max": 140.0, "unit": "mg/dL", "name": "Gula Darah Sewaktu (RBS)"},
    "hgb": {"min": 12.0, "max": 17.5, "unit": "g/dL", "name": "Hemoglobin (Hgb)"},
    "lymfosit%": {"min": 20.0, "max": 40.0, "unit": "%", "name": "Limfosit %"},
    "mch": {"min": 27.0, "max": 33.0, "unit": "pg", "name": "MCH"},
    "mchc": {"min": 32.0, "max": 36.0, "unit": "g/dL", "name": "MCHC"},
    "mcv": {"min": 80.0, "max": 100.0, "unit": "fL", "name": "MCV"},
    "ureum": {"min": 15.0, "max": 45.0, "unit": "mg/dL", "name": "Ureum"},
    "wbc": {"min": 4.0, "max": 11.0, "unit": "10^3/uL", "name": "Leukosit (WBC)"},
}


def get_available_ollama_model() -> Optional[str]:
    """Check running Ollama instance and return the best available model."""
    try:
        req = urllib.request.Request(f"{OLLAMA_BASE_URL}/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=3) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                models = [m.get("name", "") for m in data.get("models", [])]
                
                # Check preference order
                for preferred in PREFERRED_MODELS:
                    for installed in models:
                        if preferred in installed:
                            return installed
                # If any other model exists, use the first one
                if models:
                    return models[0]
    except Exception as e:
        logger.debug("Ollama service not available: %s", e)
    return None


def generate_fallback_rules(
    class_id: int,
    class_name: str,
    top_drivers: List[str],
) -> Dict[str, Any]:
    """Deterministic clinical rule-based recommendations when Ollama is unavailable."""
    clean_name = class_name.replace("Spes. ", "")
    drivers_str = " dan ".join(top_drivers) if top_drivers else "profil laboratorium Anda"

    if class_id == 1:
        summary = (
            f"AI mendeteksi indikasi peningkatan risiko pada kategori {clean_name}. "
            f"Berdasarkan analisis SHAP, parameter {drivers_str} merupakan faktor pendorong "
            f"paling dominan pada model Tabular Conformer yang memerlukan evaluasi kardiovaskular."
        )
        recommendations = [
            {
                "label": "Tindakan Medis",
                "text": "Disarankan berkonsultasi dengan Dokter Spesialis Jantung (Sp.JP) untuk pemeriksaan EKG atau profil lipid lanjutan.",
            },
            {
                "label": "Pola Makan",
                "text": "Kurangi asupan lemak jenuh, santan, makanan bergaram tinggi, dan perbanyak serat dari sayur serta buah segar.",
            },
            {
                "label": "Gaya Hidup",
                "text": "Hindari stres berlebih, pastikan waktu tidur cukup 7-8 jam, dan lakukan latihan aerobik ringan teratur 30 menit sehari.",
            },
        ]
    elif class_id == 2:
        summary = (
            f"AI mendeteksi indikasi peningkatan risiko terkait spesialisasi {clean_name} (fungsi metabolik dan ginjal). "
            f"Parameter {drivers_str} terindikasi menyimpang dari ambang batas optimal menurut kalkulasi atribusi SHAP."
        )
        recommendations = [
            {
                "label": "Tindakan Medis",
                "text": "Disarankan berkonsultasi dengan Dokter Spesialis Penyakit Dalam (Sp.PD) untuk evaluasi lanjutan HbA1c dan fungsi ginjal.",
            },
            {
                "label": "Pola Makan",
                "text": "Batasi konsumsi gula sederhana, makanan karbohidrat olahan tinggi, serta penuhi hidrasi air putih minimal 2 liter/hari.",
            },
            {
                "label": "Gaya Hidup",
                "text": "Lakukan pemantauan gula darah dan tekanan darah rutin di rumah, serta pertahankan rutinitas aktivitas fisik harian.",
            },
        ]
    elif class_id == 3:
        summary = (
            f"AI mendeteksi indikasi peningkatan risiko terkait spesialisasi {clean_name} (saluran respiratorik dan inflamasi). "
            f"Analisis SHAP menunjukkan parameter {drivers_str} memberikan kontribusi terbesar dalam menaikkan probabilitas kelas ini."
        )
        recommendations = [
            {
                "label": "Tindakan Medis",
                "text": "Disarankan berkonsultasi dengan Dokter Spesialis Paru (Sp.P) untuk evaluasi fungsi pernapasan atau Rontgen dada bila perlu.",
            },
            {
                "label": "Pola Makan",
                "text": "Tingkatkan konsumsi makanan bernutrisi tinggi antioksidan (vitamin C dan E) serta protein untuk memperkuat imunitas.",
            },
            {
                "label": "Gaya Hidup",
                "text": "Hindari paparan asap rokok dan polusi udara lingkungan; gunakan masker pelindung saat bepergian keluar ruangan.",
            },
        ]
    else:
        summary = (
            f"AI mendeteksi bahwa seluruh 13 parameter profil laboratorium Anda secara umum berada "
            f"dalam rentang seimbang tanpa adanya indikasi patologis signifikan pada keempat kategori skrining."
        )
        recommendations = [
            {
                "label": "Tindakan Medis",
                "text": "Pertahankan jadwal medical check-up berkala setiap 6 hingga 12 bulan untuk pemantauan kesehatan preventif.",
            },
            {
                "label": "Pola Makan",
                "text": "Pertahankan pola makan gizi seimbang dengan porsi karbohidrat kompleks, protein nabati/hewani, dan sayur berserat.",
            },
            {
                "label": "Gaya Hidup",
                "text": "Jaga hidrasi cairan tubuh, hindari kebiasaan merokok atau begadang, dan rutin berolahraga kardio minimal 150 menit per minggu.",
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
    Generate natural medical summary & recommendations using Ollama (MedGemma / Llama).
    Automatically falls back to deterministic expert system rules if Ollama is unavailable.
    """
    top_pos_drivers = [
        f.get("feature", "") for f in top_shap_features if f.get("shap", 0) > 0
    ][:2]

    fallback = generate_fallback_rules(predicted_class_id, predicted_class_name, top_pos_drivers)

    model_name = get_available_ollama_model()
    if not model_name:
        logger.info("Ollama not reachable or no model found. Using clinical rule-based engine.")
        return fallback

    clean_class_name = predicted_class_name.replace("Spes. ", "")
    gender_str = "Laki-laki" if patient_data.get("JENIS_KELAMIN", 0) == 0 else "Perempuan"
    age_str = str(int(patient_data.get("UMUR_TAHUN", 0)))

    # Identify abnormal parameters
    abnormal_notes = []
    for feat_key, val in patient_data.items():
        if feat_key in LAB_REFERENCES:
            ref = LAB_REFERENCES[feat_key]
            if val < ref["min"]:
                abnormal_notes.append(f"- {ref['name']} ({feat_key}): {val} {ref['unit']} [RENDAH, normal: {ref['min']}-{ref['max']}]")
            elif val > ref["max"]:
                abnormal_notes.append(f"- {ref['name']} ({feat_key}): {val} {ref['unit']} [TINGGI, normal: {ref['min']}-{ref['max']}]")

    abnormal_text = "\n".join(abnormal_notes) if abnormal_notes else "- Seluruh parameter dalam rentang referensi normal."

    # SHAP details
    shap_pos_lines = [
        f"- Parameter {f.get('feature')}: SHAP +{f.get('shap', 0):.4f} (pendorong risiko)"
        for f in top_shap_features if f.get("shap", 0) > 0
    ][:3]

    prompt = f"""Anda dokter konsultan klinis skrining AetherMed (Conformer Deep Learning + SHAP XAI).
Pasien: {gender_str}, {age_str} tahun.
Hasil Prediksi: {clean_class_name} (Probabilitas {probability * 100:.1f}%).
Faktor Pendorong Risiko Terbesar (SHAP): {', '.join(shap_pos_lines) if shap_pos_lines else 'Semua parameter aman'}.
Parameter Lab di Luar Batas: {abnormal_text}.

Tuliskan output JSON sangat singkat, padat, tepat 1 kalimat tiap poin:
{{
  "ai_summary": "1-2 kalimat ringkas temuan klinis dan faktor risiko utama SHAP.",
  "tindakan_medis": "1 kalimat rujukan spesialis dan cek laboratorium lanjutan.",
  "pola_makan": "1 kalimat panduan nutrisi diet spesifik.",
  "gaya_hidup": "1 kalimat aktivitas atau pemantauan kesehatan mandiri."
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
