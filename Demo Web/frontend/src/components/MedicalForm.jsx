import React from 'react';
import { RotateCcw, Activity, User, FlaskConical, Droplet, AlertCircle } from 'lucide-react';

export default function MedicalForm({
  formData,
  onChange,
  onReset,
  onSubmit,
  isLoading,
  error,
}) {
  const handleChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div>
            <p className="font-semibold">Terjadi Kesalahan</p>
            <p className="text-xs mt-0.5 text-rose-600">{error}</p>
          </div>
        </div>
      )}

      {/* Section 1: Demografi */}
      <div className="bg-white rounded-2xl p-5 border border-[#146178]/15 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#146178]/10">
          <div className="w-7 h-7 rounded-lg bg-[#EDFBFF] text-[#146178] flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-montserrat font-bold text-sm text-[#146178]">
              1. Data Pasien (Demografi)
            </h4>
            <p className="text-[11px] text-[#5C7076]">Identitas dasar pasien yang terdaftar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* JENIS_KELAMIN */}
          <div>
            <label className="block text-[#146178] text-xs font-montserrat font-semibold mb-1.5">
              Jenis Kelamin <span className="text-rose-500">*</span>
            </label>
            <div className="w-full h-[40px] px-3 bg-[#EDFBFF] border border-[#8C8C8C]/35 rounded-lg flex items-center focus-within:border-[#146178] focus-within:ring-1 focus-within:ring-[#146178]">
              <select
                value={formData.JENIS_KELAMIN}
                onChange={(e) => handleChange('JENIS_KELAMIN', Number(e.target.value))}
                className="w-full bg-transparent text-[#1E293B] font-poppins text-xs focus:outline-none"
              >
                <option value={0}>Laki-laki (0)</option>
                <option value={1}>Perempuan (1)</option>
              </select>
            </div>
            <span className="text-[10px] text-[#5C7076] mt-1 block">Fitur: JENIS_KELAMIN</span>
          </div>

          {/* UMUR_TAHUN */}
          <div>
            <label className="block text-[#146178] text-xs font-montserrat font-semibold mb-1.5">
              Umur Pasien <span className="text-rose-500">*</span>
            </label>
            <div className="w-full h-[40px] px-3 bg-[#EDFBFF] border border-[#8C8C8C]/35 rounded-lg flex items-center justify-between focus-within:border-[#146178] focus-within:ring-1 focus-within:ring-[#146178]">
              <input
                type="number"
                step="1"
                min="0"
                max="120"
                required
                placeholder="cth: 52"
                value={formData.UMUR_TAHUN}
                onChange={(e) => handleChange('UMUR_TAHUN', e.target.value)}
                className="w-full bg-transparent text-[#1E293B] font-poppins text-xs focus:outline-none"
              />
              <span className="text-[11px] font-semibold text-[#5C7076] shrink-0 pl-2">Tahun</span>
            </div>
            <span className="text-[10px] text-[#5C7076] mt-1 block">Fitur: UMUR_TAHUN</span>
          </div>
        </div>
      </div>

      {/* Section 2: Profil Metabolik & Ginjal */}
      <div className="bg-white rounded-2xl p-5 border border-[#146178]/15 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#146178]/10">
          <div className="w-7 h-7 rounded-lg bg-[#EDFBFF] text-[#146178] flex items-center justify-center">
            <FlaskConical className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-montserrat font-bold text-sm text-[#146178]">
              2. Profil Kimia Darah, Metabolik & Ginjal
            </h4>
            <p className="text-[11px] text-[#5C7076]">Pemeriksaan lipid, fungsi ginjal, dan kadar glukosa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* cholesterol total */}
          <div>
            <label className="block text-[#146178] text-xs font-montserrat font-semibold mb-1.5">
              Kolesterol Total <span className="text-rose-500">*</span>
            </label>
            <div className="w-full h-[40px] px-3 bg-[#EDFBFF] border border-[#8C8C8C]/35 rounded-lg flex items-center justify-between focus-within:border-[#146178] focus-within:ring-1 focus-within:ring-[#146178]">
              <input
                type="number"
                step="any"
                required
                placeholder="cth: 180"
                value={formData['cholesterol total']}
                onChange={(e) => handleChange('cholesterol total', e.target.value)}
                className="w-full bg-transparent text-[#1E293B] font-poppins text-xs focus:outline-none"
              />
              <span className="text-[10px] font-semibold text-[#5C7076] shrink-0 pl-1">mg/dL</span>
            </div>
            <span className="text-[10px] text-[#5C7076] mt-1 block">Fitur: cholesterol total</span>
          </div>

          {/* creatinin */}
          <div>
            <label className="block text-[#146178] text-xs font-montserrat font-semibold mb-1.5">
              Kreatinin <span className="text-rose-500">*</span>
            </label>
            <div className="w-full h-[40px] px-3 bg-[#EDFBFF] border border-[#8C8C8C]/35 rounded-lg flex items-center justify-between focus-within:border-[#146178] focus-within:ring-1 focus-within:ring-[#146178]">
              <input
                type="number"
                step="any"
                required
                placeholder="cth: 0.9"
                value={formData.creatinin}
                onChange={(e) => handleChange('creatinin', e.target.value)}
                className="w-full bg-transparent text-[#1E293B] font-poppins text-xs focus:outline-none"
              />
              <span className="text-[10px] font-semibold text-[#5C7076] shrink-0 pl-1">mg/dL</span>
            </div>
            <span className="text-[10px] text-[#5C7076] mt-1 block">Fitur: creatinin</span>
          </div>

          {/* ureum */}
          <div>
            <label className="block text-[#146178] text-xs font-montserrat font-semibold mb-1.5">
              Ureum <span className="text-rose-500">*</span>
            </label>
            <div className="w-full h-[40px] px-3 bg-[#EDFBFF] border border-[#8C8C8C]/35 rounded-lg flex items-center justify-between focus-within:border-[#146178] focus-within:ring-1 focus-within:ring-[#146178]">
              <input
                type="number"
                step="any"
                required
                placeholder="cth: 30"
                value={formData.ureum}
                onChange={(e) => handleChange('ureum', e.target.value)}
                className="w-full bg-transparent text-[#1E293B] font-poppins text-xs focus:outline-none"
              />
              <span className="text-[10px] font-semibold text-[#5C7076] shrink-0 pl-1">mg/dL</span>
            </div>
            <span className="text-[10px] text-[#5C7076] mt-1 block">Fitur: ureum</span>
          </div>

          {/* fbs */}
          <div>
            <label className="block text-[#146178] text-xs font-montserrat font-semibold mb-1.5">
              FBS (Gula Darah Puasa) <span className="text-rose-500">*</span>
            </label>
            <div className="w-full h-[40px] px-3 bg-[#EDFBFF] border border-[#8C8C8C]/35 rounded-lg flex items-center justify-between focus-within:border-[#146178] focus-within:ring-1 focus-within:ring-[#146178]">
              <input
                type="number"
                step="any"
                required
                placeholder="cth: 95"
                value={formData.fbs}
                onChange={(e) => handleChange('fbs', e.target.value)}
                className="w-full bg-transparent text-[#1E293B] font-poppins text-xs focus:outline-none"
              />
              <span className="text-[10px] font-semibold text-[#5C7076] shrink-0 pl-1">mg/dL</span>
            </div>
            <span className="text-[10px] text-[#5C7076] mt-1 block">Fitur: fbs</span>
          </div>

          {/* rbs */}
          <div>
            <label className="block text-[#146178] text-xs font-montserrat font-semibold mb-1.5">
              RBS (Gula Darah Sewaktu) <span className="text-rose-500">*</span>
            </label>
            <div className="w-full h-[40px] px-3 bg-[#EDFBFF] border border-[#8C8C8C]/35 rounded-lg flex items-center justify-between focus-within:border-[#146178] focus-within:ring-1 focus-within:ring-[#146178]">
              <input
                type="number"
                step="any"
                required
                placeholder="cth: 120"
                value={formData.rbs}
                onChange={(e) => handleChange('rbs', e.target.value)}
                className="w-full bg-transparent text-[#1E293B] font-poppins text-xs focus:outline-none"
              />
              <span className="text-[10px] font-semibold text-[#5C7076] shrink-0 pl-1">mg/dL</span>
            </div>
            <span className="text-[10px] text-[#5C7076] mt-1 block">Fitur: rbs</span>
          </div>
        </div>
      </div>

      {/* Section 3: Hematologi / Profil Darah */}
      <div className="bg-white rounded-2xl p-5 border border-[#146178]/15 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#146178]/10">
          <div className="w-7 h-7 rounded-lg bg-[#EDFBFF] text-[#146178] flex items-center justify-center">
            <Droplet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-montserrat font-bold text-sm text-[#146178]">
              3. Profil Darah Lengkap (Hematologi)
            </h4>
            <p className="text-[11px] text-[#5C7076]">Pemeriksaan hemoglobin, leukosit, dan indeks eritrosit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* hgb */}
          <div>
            <label className="block text-[#146178] text-xs font-montserrat font-semibold mb-1.5">
              Hemoglobin (HGB) <span className="text-rose-500">*</span>
            </label>
            <div className="w-full h-[40px] px-3 bg-[#EDFBFF] border border-[#8C8C8C]/35 rounded-lg flex items-center justify-between focus-within:border-[#146178] focus-within:ring-1 focus-within:ring-[#146178]">
              <input
                type="number"
                step="any"
                required
                placeholder="cth: 13.5"
                value={formData.hgb}
                onChange={(e) => handleChange('hgb', e.target.value)}
                className="w-full bg-transparent text-[#1E293B] font-poppins text-xs focus:outline-none"
              />
              <span className="text-[10px] font-semibold text-[#5C7076] shrink-0 pl-1">g/dL</span>
            </div>
            <span className="text-[10px] text-[#5C7076] mt-1 block">Fitur: hgb</span>
          </div>

          {/* wbc */}
          <div>
            <label className="block text-[#146178] text-xs font-montserrat font-semibold mb-1.5">
              Leukosit (WBC) <span className="text-rose-500">*</span>
            </label>
            <div className="w-full h-[40px] px-3 bg-[#EDFBFF] border border-[#8C8C8C]/35 rounded-lg flex items-center justify-between focus-within:border-[#146178] focus-within:ring-1 focus-within:ring-[#146178]">
              <input
                type="number"
                step="any"
                required
                placeholder="cth: 7.2"
                value={formData.wbc}
                onChange={(e) => handleChange('wbc', e.target.value)}
                className="w-full bg-transparent text-[#1E293B] font-poppins text-xs focus:outline-none"
              />
              <span className="text-[10px] font-semibold text-[#5C7076] shrink-0 pl-1">10³/µL</span>
            </div>
            <span className="text-[10px] text-[#5C7076] mt-1 block">Fitur: wbc</span>
          </div>

          {/* lymfosit% */}
          <div>
            <label className="block text-[#146178] text-xs font-montserrat font-semibold mb-1.5">
              Limfosit (%) <span className="text-rose-500">*</span>
            </label>
            <div className="w-full h-[40px] px-3 bg-[#EDFBFF] border border-[#8C8C8C]/35 rounded-lg flex items-center justify-between focus-within:border-[#146178] focus-within:ring-1 focus-within:ring-[#146178]">
              <input
                type="number"
                step="any"
                min="0"
                max="100"
                required
                placeholder="cth: 30"
                value={formData['lymfosit%']}
                onChange={(e) => handleChange('lymfosit%', e.target.value)}
                className="w-full bg-transparent text-[#1E293B] font-poppins text-xs focus:outline-none"
              />
              <span className="text-[10px] font-semibold text-[#5C7076] shrink-0 pl-1">%</span>
            </div>
            <span className="text-[10px] text-[#5C7076] mt-1 block">Fitur: lymfosit%</span>
          </div>

          {/* mch */}
          <div>
            <label className="block text-[#146178] text-xs font-montserrat font-semibold mb-1.5">
              MCH <span className="text-rose-500">*</span>
            </label>
            <div className="w-full h-[40px] px-3 bg-[#EDFBFF] border border-[#8C8C8C]/35 rounded-lg flex items-center justify-between focus-within:border-[#146178] focus-within:ring-1 focus-within:ring-[#146178]">
              <input
                type="number"
                step="any"
                required
                placeholder="cth: 27"
                value={formData.mch}
                onChange={(e) => handleChange('mch', e.target.value)}
                className="w-full bg-transparent text-[#1E293B] font-poppins text-xs focus:outline-none"
              />
              <span className="text-[10px] font-semibold text-[#5C7076] shrink-0 pl-1">pg</span>
            </div>
            <span className="text-[10px] text-[#5C7076] mt-1 block">Fitur: mch</span>
          </div>

          {/* mchc */}
          <div>
            <label className="block text-[#146178] text-xs font-montserrat font-semibold mb-1.5">
              MCHC <span className="text-rose-500">*</span>
            </label>
            <div className="w-full h-[40px] px-3 bg-[#EDFBFF] border border-[#8C8C8C]/35 rounded-lg flex items-center justify-between focus-within:border-[#146178] focus-within:ring-1 focus-within:ring-[#146178]">
              <input
                type="number"
                step="any"
                required
                placeholder="cth: 33"
                value={formData.mchc}
                onChange={(e) => handleChange('mchc', e.target.value)}
                className="w-full bg-transparent text-[#1E293B] font-poppins text-xs focus:outline-none"
              />
              <span className="text-[10px] font-semibold text-[#5C7076] shrink-0 pl-1">g/dL</span>
            </div>
            <span className="text-[10px] text-[#5C7076] mt-1 block">Fitur: mchc</span>
          </div>

          {/* mcv */}
          <div>
            <label className="block text-[#146178] text-xs font-montserrat font-semibold mb-1.5">
              MCV <span className="text-rose-500">*</span>
            </label>
            <div className="w-full h-[40px] px-3 bg-[#EDFBFF] border border-[#8C8C8C]/35 rounded-lg flex items-center justify-between focus-within:border-[#146178] focus-within:ring-1 focus-within:ring-[#146178]">
              <input
                type="number"
                step="any"
                required
                placeholder="cth: 82"
                value={formData.mcv}
                onChange={(e) => handleChange('mcv', e.target.value)}
                className="w-full bg-transparent text-[#1E293B] font-poppins text-xs focus:outline-none"
              />
              <span className="text-[10px] font-semibold text-[#5C7076] shrink-0 pl-1">fL</span>
            </div>
            <span className="text-[10px] text-[#5C7076] mt-1 block">Fitur: mcv</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onReset}
          disabled={isLoading}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#8C8C8C]/40 text-[#5C7076] hover:bg-slate-100 font-montserrat font-medium text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Form
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#146178] to-[#0ea5e9] hover:from-[#0f4a5c] hover:to-[#0284c7] text-white font-montserrat font-bold text-xs shadow-md shadow-[#146178]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses Inferensi & SHAP...
            </>
          ) : (
            <>
              <Activity className="w-4 h-4 text-[#77F9D0]" />
              Analisis Prediksi & XAI
            </>
          )}
        </button>
      </div>
    </form>
  );
}
