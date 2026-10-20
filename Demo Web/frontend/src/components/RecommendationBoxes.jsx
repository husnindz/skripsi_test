import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ClipboardList, Cpu, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import { fetchAIRecommendations } from '../utils/api';

export default function RecommendationBoxes({ result, formData }) {
  if (!result || !result.prediction) return null;

  const { prediction, explanation, probabilities } = result;
  const classId = prediction.class_id;

  // Identify top 2 SHAP positive drivers for initial template
  const positiveDrivers = (explanation?.features || [])
    .filter((f) => f.shap > 0)
    .slice(0, 2)
    .map((f) => f.feature);

  const topDriversText = positiveDrivers.length > 0
    ? `khususnya parameter ${positiveDrivers.join(' dan ')}`
    : 'berdasarkan profil kimia darah Anda';

  // Fallback Rule-Based Summary
  const getInitialAiSummary = () => {
    switch (classId) {
      case 1:
        return `AI mendeteksi adanya indikasi peningkatan risiko terkait kondisi Jantung dan Pembuluh Darah Anda berdasarkan parameter profil laboratorium Anda. Analisis SHAP menunjukkan ${topDriversText} memberikan kontribusi terbesar dalam mendorong prediksi ini ke arah perhatian medis klinis.`;
      case 2:
        return `AI mendeteksi adanya indikasi peningkatan risiko terkait spesialisasi Penyakit Dalam (kondisi metabolik dan ginjal). Parameter ${topDriversText} terindikasi menyimpang dari ambang batas optimal dan menjadi faktor pendorong utama pada model Tabular Conformer.`;
      case 3:
        return `AI mendeteksi indikasi pola yang mengarah ke spesialisasi Paru-Paru (kondisi respiratorik dan inflamasi sistemik). Parameter profil darah Anda ${topDriversText} terindikasi memerlukan perhatian medis dan evaluasi lebih lanjut.`;
      case 0:
      default:
        return `AI mendeteksi bahwa parameter profil laboratorium Anda secara umum berada dalam rentang seimbang tanpa adanya indikasi patologis signifikan pada keempat kategori risiko yang dievaluasi.`;
    }
  };

  // Fallback Rule-Based Recommendations
  const getInitialRecommendations = () => {
    switch (classId) {
      case 1:
        return [
          {
            label: 'Tindakan Medis',
            text: 'Sangat disarankan untuk berkonsultasi dengan Dokter Spesialis Jantung (Kardiolog) untuk pemeriksaan elektrokardiogram (EKG) atau echocardiography.',
          },
          {
            label: 'Pola Makan',
            text: 'Batasi asupan lemak jenuh, gorengan, bersantan, garam berlebih, dan hindari makanan olahan tinggi kolesterol.',
          },
          {
            label: 'Gaya Hidup',
            text: 'Hindari stres berlebih, pastikan istirahat cukup 7-8 jam, dan hindari asap rokok atau aktivitas fisik yang terlalu berat secara mendadak.',
          },
        ];
      case 2:
        return [
          {
            label: 'Tindakan Medis',
            text: 'Disarankan berkonsultasi dengan Dokter Spesialis Penyakit Dalam (Sp.PD) untuk evaluasi lanjutan fungsi metabolik (HbA1c) dan skrining ginjal berkala.',
          },
          {
            label: 'Pola Makan',
            text: 'Kurangi konsumsi gula sederhana, batasi karbohidrat olahan, dan cukupi kebutuhan hidrasi air putih minimal 2 liter/hari sesuai anjuran medis.',
          },
          {
            label: 'Gaya Hidup',
            text: 'Lakukan pemantauan gula darah dan tekanan darah rutin di rumah, serta pertahankan aktivitas fisik jalan santai 30 menit setiap hari.',
          },
        ];
      case 3:
        return [
          {
            label: 'Tindakan Medis',
            text: 'Disarankan berkonsultasi dengan Dokter Spesialis Paru (Sp.P) untuk evaluasi saluran pernapasan (Rontgen toraks/dada atau spirometri).',
          },
          {
            label: 'Pola Makan',
            text: 'Tingkatkan asupan makanan kaya antioksidan, vitamin C, vitamin D, dan protein berkualitas untuk mendukung sistem imun tubuh.',
          },
          {
            label: 'Gaya Hidup',
            text: 'Hindari paparan asap rokok, polusi udara, dan debu; gunakan masker di luar ruangan serta jaga ventilasi sirkulasi udara ruangan tetap bersih.',
          },
        ];
      case 0:
      default:
        return [
          {
            label: 'Tindakan Medis',
            text: 'Pertahankan pemeriksaan Medical Check-up secara berkala setidaknya 1 tahun sekali untuk deteksi dini berkelanjutan.',
          },
          {
            label: 'Pola Makan',
            text: 'Pertahankan pola makan bergizi seimbang dengan memperbanyak konsumsi serat, sayuran hijau, dan buah-buahan segar.',
          },
          {
            label: 'Gaya Hidup',
            text: 'Jaga kebiasaan olahraga teratur 150 menit per minggu, tidur teratur, dan kelola tingkat stres harian dengan baik.',
          },
        ];
    }
  };

  const [aiSummary, setAiSummary] = useState(getInitialAiSummary());
  const [recommendations, setRecommendations] = useState(getInitialRecommendations());
  const [engine, setEngine] = useState('rule-based');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const currentReqRef = useRef(0);
  const abortCtrlRef = useRef(null);

  const loadAiNarrative = async () => {
    // Abort any prior in-flight request to prevent queuing Ollama CPU
    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
    }
    const abortController = new AbortController();
    abortCtrlRef.current = abortController;

    const requestId = ++currentReqRef.current;
    setIsLoadingAi(true);

    try {
      const topShap = (explanation?.features || []).map((f) => ({
        feature: f.feature,
        shap: f.shap,
        value: f.value,
      }));

      const highestProb = probabilities ? (probabilities[prediction.class_name] || 0) : 0;

      const response = await fetchAIRecommendations({
        patientData: formData || {},
        predictedClassId: prediction.class_id,
        predictedClassName: prediction.class_name,
        probability: highestProb,
        topShapFeatures: topShap,
        signal: abortController.signal,
      });

      if (requestId === currentReqRef.current && response && response.ai_summary) {
        setAiSummary(response.ai_summary);
        if (response.recommendations && response.recommendations.length > 0) {
          setRecommendations(response.recommendations);
        }
        setEngine(response.engine || 'ollama');
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      console.warn('Ollama AI recommendation fallback triggered:', err);
    } finally {
      if (requestId === currentReqRef.current) {
        setIsLoadingAi(false);
      }
    }
  };

  // Trigger AI generation whenever new prediction arrives
  useEffect(() => {
    // Reset to fallback first for instant responsive UI
    setAiSummary(getInitialAiSummary());
    setRecommendations(getInitialRecommendations());
    setEngine('rule-based');

    const timer = setTimeout(() => {
      loadAiNarrative();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (abortCtrlRef.current) {
        abortCtrlRef.current.abort();
      }
    };
  }, [result]);

  const renderBadge = () => {
    if (isLoadingAi) {
      return (
        <span className="px-2.5 py-0.5 rounded-[4px] bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-700 tracking-wider uppercase flex items-center gap-1.5 animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
          OLLAMA REASONING...
        </span>
      );
    }

    if (engine.toLowerCase().includes('medgemma')) {
      return (
        <span className="px-2.5 py-0.5 rounded-[4px] bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 tracking-wider uppercase flex items-center gap-1">
          <Cpu className="w-3 h-3 text-emerald-600" />
          MEDGEMMA 1.5 4B
        </span>
      );
    }

    if (engine.toLowerCase().includes('llama')) {
      return (
        <span className="px-2.5 py-0.5 rounded-[4px] bg-sky-50 border border-sky-200 text-[10px] font-bold text-sky-700 tracking-wider uppercase flex items-center gap-1">
          <Cpu className="w-3 h-3 text-sky-600" />
          LLAMA 3.2 3B
        </span>
      );
    }

    return (
      <span className="px-2.5 py-0.5 rounded-[4px] bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-600 tracking-wider uppercase">
        RULE-BASED (OFFLINE FALLBACK)
      </span>
    );
  };

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Box 1: Ringkasan Asisten AI */}
        <div className="bg-white border border-[#AFAFAF]/20 rounded-[20px] p-6 shadow-[0px_4px_16px_rgba(20,97,120,0.06)] flex flex-col justify-between text-left transition-all">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 flex-wrap gap-2">
              <h4 className="font-montserrat font-bold text-base text-[#146178] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                Ringkasan Asisten AI
              </h4>
              <div className="flex items-center gap-2">
                {renderBadge()}
                <button
                  type="button"
                  onClick={loadAiNarrative}
                  disabled={isLoadingAi}
                  title="Regenerate analisis AI"
                  className="p-1 rounded-md text-slate-400 hover:text-[#146178] hover:bg-slate-100 transition-colors disabled:opacity-40"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin text-[#146178]' : ''}`} />
                </button>
              </div>
            </div>

            <div className="relative">
              {isLoadingAi && (
                <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs text-amber-800 flex items-center gap-2 font-poppins">
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-amber-600" />
                  <span>MedGemma sedang membaca kontribusi SHAP dan parameter lab Anda...</span>
                </div>
              )}
              <p className="font-poppins text-slate-700 text-sm leading-relaxed transition-opacity duration-300">
                {aiSummary}
              </p>
            </div>
          </div>
        </div>

        {/* Box 2: Rekomendasi Tindak Lanjut */}
        <div className="bg-white border border-[#AFAFAF]/20 rounded-[20px] p-6 shadow-[0px_4px_16px_rgba(20,97,120,0.06)] flex flex-col justify-between text-left transition-all">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 flex-wrap gap-2">
              <h4 className="font-montserrat font-bold text-base text-[#146178] flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#146178]" />
                Rekomendasi Tindak Lanjut
              </h4>
              <div className="flex items-center gap-2">
                {renderBadge()}
              </div>
            </div>

            <div className="space-y-3 font-poppins text-sm">
              {recommendations.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-[#17ADBD]" />
                  <p className="text-slate-700 leading-relaxed">
                    <strong className="font-semibold text-slate-900">{item.label}:</strong> {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Disclaimer CDSS */}
      <div className="text-center md:text-left px-2">
        <p className="text-[11px] text-slate-400 font-poppins leading-relaxed">
          * <strong className="text-slate-500 font-medium">Clinical Decision Support System (CDSS) Disclaimer:</strong> Narasi AI dan rekomendasi tindak lanjut merupakan inferensi penjelas berbasis kontribusi nilai SHAP dan panduan klinis baku (ACC/AHA, ADA, KDIGO, WHO). Informasi ini ditujukan sebagai pendukung skrining edukatif dan bukan merupakan diagnosis medis definitif tanpa evaluasi klinis langsung oleh Dokter Penanggung Jawab Pelayanan (DPJP).
        </p>
      </div>
    </div>
  );
}
