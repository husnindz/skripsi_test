import React from 'react';
import { HeartPulse, Stethoscope, Wind, CheckCircle2, Award, Activity } from 'lucide-react';

export default function PredictionResult({ result }) {
  if (!result || !result.prediction) return null;

  const { prediction, probabilities, mode } = result;

  const getClassTheme = (classId) => {
    switch (classId) {
      case 0:
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-[#77F9D0]" />,
          badgeBg: 'bg-[#17ADBD] text-white',
          barColor: 'bg-[#17ADBD]',
          textColor: 'text-[#146178]',
        };
      case 1:
        return {
          icon: <HeartPulse className="w-5 h-5 text-[#77F9D0]" />,
          badgeBg: 'bg-[#EB5050] text-white',
          barColor: 'bg-[#EB5050]',
          textColor: 'text-rose-700',
        };
      case 2:
        return {
          icon: <Stethoscope className="w-5 h-5 text-[#77F9D0]" />,
          badgeBg: 'bg-[#F2C039] text-[#836512]',
          barColor: 'bg-[#F2C039]',
          textColor: 'text-amber-700',
        };
      case 3:
        return {
          icon: <Wind className="w-5 h-5 text-[#77F9D0]" />,
          badgeBg: 'bg-sky-500 text-white',
          barColor: 'bg-sky-500',
          textColor: 'text-sky-700',
        };
      default:
        return {
          icon: <Award className="w-5 h-5 text-[#77F9D0]" />,
          badgeBg: 'bg-[#146178] text-white',
          barColor: 'bg-[#146178]',
          textColor: 'text-[#146178]',
        };
    }
  };

  const currentTheme = getClassTheme(prediction.class_id);
  const highestProb = probabilities[prediction.class_name] || 0;
  const highestProbPercent = (highestProb * 100).toFixed(1);
  const formatClassName = (name) => (name ? name.replace(/^Spes\.\s*/i, '') : '');

  return (
    <div className="w-full bg-[#EDFBFF] border border-[#AFAFAF]/20 rounded-[20px] p-6 sm:p-8 shadow-[0px_4px_16px_rgba(20,97,120,0.06)] space-y-6 text-left">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#AFAFAF]/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#146178] rounded-[7px] flex items-center justify-center shrink-0 shadow-xs">
              {currentTheme.icon}
            </div>
            <span className="text-[#5C7076] text-xs sm:text-sm font-poppins font-medium">
              Hasil Skrining Model Conformer
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${currentTheme.badgeBg}`}>
              Kelas {prediction.class_id}
            </span>
          </div>

          <h3 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#146178] tracking-tight">
            {formatClassName(prediction.class_name)}
          </h3>

          <p className="text-xs text-[#5C7076] font-poppins">
            Prediksi inferensi model berdasarkan 13 parameter klinis laboratorium pasien
          </p>
        </div>

        {/* Confidence Percentage Gauge */}
        <div className="flex flex-col items-start sm:items-end sm:border-l sm:border-[#AFAFAF]/30 sm:pl-8 shrink-0">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-extrabold font-montserrat text-[#146178]">
              {highestProbPercent}
            </span>
            <span className="text-xl font-bold font-montserrat text-[#146178]">%</span>
          </div>
          <span className="text-xs text-[#5C7076] font-poppins font-medium">
            Tingkat Probabilitas
          </span>
        </div>
      </div>

      {/* Probabilities Distribution Bars */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-montserrat font-bold text-sm text-[#146178] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#146178]" />
            Distribusi Probabilitas Semua Kategori
          </h4>
          <span className="text-xs text-[#5C7076] font-poppins">
            Total bobot softmax: 100%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {Object.entries(probabilities).map(([className, prob], idx) => {
            const isWinner = className === prediction.class_name;
            const percent = (prob * 100).toFixed(1);
            const classTheme = getClassTheme(idx);

            return (
              <div
                key={className}
                className={`p-3.5 rounded-xl border transition-all ${
                  isWinner
                    ? 'bg-white border-[#146178]/30 shadow-xs'
                    : 'bg-white/60 border-slate-200/80'
                }`}
              >
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span
                    className={`font-poppins flex items-center gap-2 ${
                      isWinner ? 'font-bold text-[#146178]' : 'text-slate-600'
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        isWinner ? classTheme.barColor : 'bg-slate-300'
                      }`}
                    />
                    <span className="truncate">{formatClassName(className)}</span>
                  </span>
                  <span
                    className={`font-montserrat shrink-0 ml-2 ${
                      isWinner ? 'font-extrabold text-[#146178]' : 'text-slate-500'
                    }`}
                  >
                    {percent}%
                  </span>
                </div>

                <div className="w-full h-2 bg-[#EDFBFF] rounded-full overflow-hidden border border-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      isWinner ? classTheme.barColor : 'bg-slate-300'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
