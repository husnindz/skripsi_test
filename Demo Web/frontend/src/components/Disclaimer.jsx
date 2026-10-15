import React from 'react';

export default function Disclaimer() {
  return (
    <div className="w-full bg-[#146178] p-6 sm:p-8 rounded-[20px] text-left text-white shadow-xl shadow-[#146178]/10 select-none">
      <div className="flex items-center gap-3.5 mb-3.5">
        <h3 className="font-montserrat font-bold text-2xl sm:text-[30px] text-[#77F9D0]">
          Disclaimer
        </h3>
        <div className="w-[34px] h-[34px] bg-[#F2C039] rounded-[6px] flex items-center justify-center shrink-0 shadow-xs">
          <svg
            className="w-5 h-5 text-[#836512]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      </div>

      <p className="font-poppins text-xs sm:text-sm text-white/90 leading-relaxed font-light">
        AetherMed merupakan alat bantu skrining awal berbasis kecerdasan buatan (Deep Learning Tabular Conformer) dan penjelasan medis terintegrasi (SHAP) yang dirancang untuk membantu pengguna dalam memperoleh gambaran awal terkait kondisi kesehatan berdasarkan data laboratorium yang dimasukkan. Sistem ini dikembangkan sebagai media pendukung analisis awal dan edukasi kesehatan, bukan sebagai alat diagnosis utama maupun pengganti tenaga medis profesional. Pengguna sangat disarankan untuk selalu berkonsultasi langsung dengan dokter spesialis atau tenaga medis terpercaya untuk verifikasi klinis definitif.
      </p>
    </div>
  );
}
