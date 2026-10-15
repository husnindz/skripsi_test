import React from 'react';
import { BarChart3, HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function ShapChart({ explanation, predictedClassName }) {
  if (!explanation || !explanation.features || explanation.features.length === 0) return null;

  // Show top 8 features by absolute contribution
  const topFeatures = explanation.features.slice(0, 8);
  const maxAbsShap = Math.max(...topFeatures.map((f) => Math.abs(f.shap)), 0.01);

  return (
    <div className="w-full bg-[#EDFBFF] border border-[#AFAFAF]/20 rounded-[20px] p-6 sm:p-8 shadow-[0px_4px_16px_rgba(20,97,120,0.06)] space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#AFAFAF]/20">
        <div>
          <h4 className="font-montserrat font-bold text-xl sm:text-2xl text-[#146178] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#146178]" />
            Visualisasi Kontribusi Fitur (SHAP XAI)
          </h4>
          <p className="text-xs sm:text-sm text-[#5C7076] font-poppins mt-1">
            Fitur yang paling mendorong maupun menurunkan prediksi model terhadap <span className="font-semibold text-[#146178]">{predictedClassName}</span>
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold font-poppins shrink-0 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#146178]" />
            <span className="text-slate-700">Mendorong (+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#EB5050]" />
            <span className="text-slate-700">Menurunkan (-)</span>
          </div>
        </div>
      </div>

      {/* Spacious 2-Column Responsive Bars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {topFeatures.map((item) => {
          const isPositive = item.shap >= 0;
          const barWidthPercent = Math.min(100, Math.round((Math.abs(item.shap) / maxAbsShap) * 100));

          return (
            <div key={item.feature} className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <div className="flex items-center gap-1.5 truncate">
                  {isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-[#146178] shrink-0" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-[#EB5050] shrink-0" />
                  )}
                  <span className="font-poppins font-semibold text-slate-800 truncate">
                    {item.feature}
                  </span>
                  <span className="text-[11px] text-[#5C7076] bg-[#EDFBFF] border border-[#146178]/15 px-1.5 py-0.5 rounded-md shrink-0">
                    {item.value}
                  </span>
                </div>

                <div className="font-montserrat font-bold text-xs shrink-0 ml-2">
                  <span className={isPositive ? 'text-[#146178]' : 'text-rose-600'}>
                    {isPositive ? `+${item.shap.toFixed(4)}` : item.shap.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Bar track */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    isPositive
                      ? 'bg-gradient-to-r from-[#146178]/80 to-[#146178]'
                      : 'bg-gradient-to-r from-rose-400 to-[#EB5050]'
                  }`}
                  style={{ width: `${Math.max(barWidthPercent, 6)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Interpretation helper */}
      <div className="p-4 rounded-xl bg-white border border-[#146178]/20 flex items-start gap-3 text-xs sm:text-sm text-[#146178] shadow-2xs">
        <HelpCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#146178]" />
        <p className="leading-relaxed font-poppins">
          <strong>Interpretasi Nilai SHAP:</strong> Nilai kontribusi positif menandakan bahwa nilai parameter laboratorium pasien mendorong model untuk menetapkan diagnosa kelas ini. Nilai kontribusi negatif menandakan parameter tersebut menurunkan keyakinan model terhadap kelas yang bersangkutan.
        </p>
      </div>

    </div>
  );
}
