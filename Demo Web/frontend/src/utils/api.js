/**
 * API client for AetherMed FastAPI backend
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed (${res.status})`);
    return await res.json();
  } catch (err) {
    console.warn('API health check error:', err);
    return { status: 'offline', model_loaded: false, mode: 'unknown' };
  }
}

export async function predictCheckUp(inputData) {
  const payload = {
    JENIS_KELAMIN: Number(inputData.JENIS_KELAMIN),
    UMUR_TAHUN: parseFloat(inputData.UMUR_TAHUN),
    'cholesterol total': parseFloat(inputData['cholesterol total']),
    creatinin: parseFloat(inputData.creatinin),
    fbs: parseFloat(inputData.fbs),
    rbs: parseFloat(inputData.rbs),
    hgb: parseFloat(inputData.hgb),
    'lymfosit%': parseFloat(inputData['lymfosit%']),
    mch: parseFloat(inputData.mch),
    mchc: parseFloat(inputData.mchc),
    mcv: parseFloat(inputData.mcv),
    ureum: parseFloat(inputData.ureum),
    wbc: parseFloat(inputData.wbc),
  };

  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || `Prediksi gagal (${res.status})`);
  }

  return await res.json();
}

export async function fetchAIRecommendations({
  patientData,
  predictedClassId,
  predictedClassName,
  probability,
  topShapFeatures,
  signal,
}) {
  const payload = {
    patient_data: patientData,
    predicted_class_id: predictedClassId,
    predicted_class_name: predictedClassName,
    probability: probability,
    top_shap_features: topShapFeatures,
  };

  const res = await fetch(`${API_BASE}/ai-recommendations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.detail || `Gagal mengambil rekomendasi AI (${res.status})`);
  }

  return await res.json();
}
