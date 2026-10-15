import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import SamplePresets from './components/SamplePresets';
import MedicalForm from './components/MedicalForm';
import PredictionResult from './components/PredictionResult';
import ParametersTable from './components/ParametersTable';
import ShapChart from './components/ShapChart';
import RecommendationBoxes from './components/RecommendationBoxes';
import Disclaimer from './components/Disclaimer';
import { SAMPLE_PATIENTS } from './utils/samples';
import { fetchHealth, predictCheckUp } from './utils/api';
import { Sparkles, Layers, Activity } from 'lucide-react';

const INITIAL_FORM = { ...SAMPLE_PATIENTS[0].data };

const BLANK_FORM = {
  JENIS_KELAMIN: 0,
  UMUR_TAHUN: '',
  'cholesterol total': '',
  creatinin: '',
  fbs: '',
  rbs: '',
  hgb: '',
  'lymfosit%': '',
  mch: '',
  mchc: '',
  mcv: '',
  ureum: '',
  wbc: '',
};

export default function App() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [activeSampleId, setActiveSampleId] = useState(SAMPLE_PATIENTS[0].id);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const resultRef = useRef(null);

  // Check backend health on mount & auto-predict initial sample
  useEffect(() => {
    async function init() {
      const healthData = await fetchHealth();
      setHealth(healthData);
      
      // Auto-run initial sample so page immediately shows complete results
      try {
        setIsLoading(true);
        const res = await predictCheckUp(INITIAL_FORM);
        setResult(res);
      } catch (err) {
        console.warn('Initial prediction note:', err.message);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const handleSelectSample = (sample) => {
    setActiveSampleId(sample.id);
    setFormData({ ...sample.data });
    setError('');
  };

  const handleSelectNewInput = () => {
    setActiveSampleId('new-input');
    setFormData({ ...BLANK_FORM });
    setError('');
  };

  const handleReset = () => {
    if (activeSampleId === 'new-input') {
      setFormData({ ...BLANK_FORM });
    } else {
      setFormData({ ...SAMPLE_PATIENTS[0].data });
      setActiveSampleId(SAMPLE_PATIENTS[0].id);
    }
    setError('');
  };

  const handleFormChange = (newValues) => {
    setFormData(newValues);
    if (activeSampleId !== 'new-input') {
      setActiveSampleId('new-input');
    }
  };

  const handleSubmit = async () => {
    // Validate that all fields have values
    const hasEmptyField = Object.entries(formData).some(([_, val]) => val === '' || val === null || val === undefined);
    if (hasEmptyField) {
      setError('Mohon lengkapi seluruh 13 parameter laboratorium sebelum melakukan analisis.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await predictCheckUp(formData);
      setResult(response);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError(err.message || 'Gagal memproses prediksi check-up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FDFF] text-[#1E293B]">
      {/* Navigation Header */}
      <Header health={health} />

      {/* Hero Welcome Banner */}
      <section className="bg-gradient-to-b from-[#EDFBFF] to-[#F8FDFF] border-b border-[#146178]/10 py-7 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="max-w-3xl space-y-2 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#146178]/15 text-xs text-[#146178] font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#146178]" />
                Tabular Conformer Deep Learning + SHAP XAI
              </div>
              <h1 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#146178] tracking-tight">
                Medical Check-up Screening & Explainable AI
              </h1>
              <p className="text-xs sm:text-sm text-[#5C7076] font-poppins leading-relaxed">
                Skrining risiko kesehatan berdasarkan 13 parameter laboratorium menggunakan arsitektur deep learning <strong>Conformer</strong> serta visualisasi kontribusi fitur lokal <strong>SHAP</strong>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0 sm:w-auto w-full">
              <div className="bg-white p-3 rounded-xl border border-[#146178]/15 shadow-2xs text-center">
                <span className="block font-montserrat font-bold text-lg text-[#146178]">13</span>
                <span className="text-[11px] text-[#5C7076] font-medium">Fitur Klinis</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#146178]/15 shadow-2xs text-center">
                <span className="block font-montserrat font-bold text-lg text-[#146178]">4</span>
                <span className="text-[11px] text-[#5C7076] font-medium">Kelas Prediksi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Single-Page Flow */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        
        {/* 1. Presets & Input Section */}
        <section className="space-y-5">
          <SamplePresets
            activeSampleId={activeSampleId}
            onSelectSample={handleSelectSample}
            onSelectNewInput={handleSelectNewInput}
          />

          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#146178]/15 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#146178]/10 text-left">
              <div>
                <h2 className="font-montserrat font-bold text-lg text-[#146178] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#146178]" />
                  Formulir Medical Check-up
                </h2>
                <p className="text-xs text-[#5C7076] font-poppins mt-0.5">
                  Masukkan nilai hasil pemeriksaan laboratorium atau gunakan tombol preset di atas
                </p>
              </div>
            </div>

            <MedicalForm
              formData={formData}
              onChange={handleFormChange}
              onReset={handleReset}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </section>

        {/* 2. Comprehensive Results Section */}
        <section ref={resultRef} className="space-y-8 pt-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#146178]/15 text-left">
            <div>
              <h2 className="font-montserrat font-bold text-xl sm:text-2xl text-[#146178] flex items-center gap-2.5">
                <Activity className="w-6 h-6 text-[#146178]" />
                Hasil Skrining & Analisis Klinis
              </h2>
              <p className="text-xs sm:text-sm text-[#5C7076] font-poppins mt-0.5">
                Hasil inferensi model Deep Learning Conformer dan evaluasi interpretasi laboratorium
              </p>
            </div>
            {result && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EDFBFF] text-[#146178] border border-[#146178]/20 shrink-0">
                {result.mode === 'model' ? 'Conformer v2 PyTorch' : 'Engine: Simulation Mode'}
              </span>
            )}
          </div>

          {isLoading && (
            <div className="w-full bg-white rounded-2xl p-12 border border-[#146178]/15 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-3 border-[#146178] border-t-transparent animate-spin mx-auto" />
              <p className="font-montserrat font-semibold text-sm text-[#146178]">
                Memproses inferensi Conformer dan menghitung kontribusi SHAP...
              </p>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-8">
              {/* Box 1: Screening Result & Probabilities */}
              <PredictionResult result={result} />

              {/* Box 2: Parameters Table with Normal Ranges (Mirai Style) */}
              <ParametersTable formData={formData} />

              {/* Box 3: SHAP Feature Contributions Chart */}
              <ShapChart
                explanation={result.explanation}
                predictedClassName={result.prediction.class_name}
              />

              {/* Box 4: AI Summary & Actionable Recommendations (Mirai Style + Ollama XAI) */}
              <RecommendationBoxes result={result} formData={formData} />

              {/* Box 5: Medical Disclaimer (Mirai Dark-Teal Style) */}
              <Disclaimer />
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#146178]/10 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-[#5C7076] font-poppins space-y-2">
          <p className="flex items-center justify-center gap-1.5 font-medium text-slate-700">
            <span className="font-montserrat font-bold text-[#146178]">AetherMed</span> — Medical Check-up Conformer XAI Demo
          </p>
          <p>
            Dirancang untuk evaluasi model Skripsi Conformer XAI • Monorepo • Siap deploy ke Hugging Face Spaces
          </p>
        </div>
      </footer>
    </div>
  );
}
