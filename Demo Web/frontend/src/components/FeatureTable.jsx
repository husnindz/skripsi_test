import React from 'react';
import { Table, ArrowUp, ArrowDown } from 'lucide-react';

export default function FeatureTable({ explanation }) {
  if (!explanation || !explanation.features) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#146178]/15 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#146178]/10">
        <div>
          <h4 className="font-montserrat font-bold text-sm text-[#146178] flex items-center gap-2">
            <Table className="w-4 h-4 text-[#146178]" />
            Tabel Kontribusi Detail (13 Fitur)
          </h4>
          <p className="text-xs text-[#5C7076] font-poppins">
            Daftar lengkap kontribusi seluruh fitur yang diurutkan berdasarkan pengaruh absolut
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#EDFBFF] text-[#146178] font-montserrat font-semibold border-b border-[#146178]/20">
              <th className="py-2.5 px-3 rounded-l-lg">Fitur Laboratorium</th>
              <th className="py-2.5 px-3">Nilai Pasien</th>
              <th className="py-2.5 px-3">Kontribusi SHAP</th>
              <th className="py-2.5 px-3 rounded-r-lg">Arah Efek</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-poppins">
            {explanation.features.map((item, idx) => {
              const isPositive = item.shap >= 0;
              return (
                <tr key={item.feature} className="hover:bg-[#F8FDFF] transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-100 text-[10px] text-slate-500 font-montserrat flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    {item.feature}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-montserrat font-semibold">
                    {item.value}
                  </td>
                  <td className="py-2.5 px-3 font-montserrat font-bold">
                    <span className={isPositive ? 'text-[#146178]' : 'text-rose-600'}>
                      {isPositive ? `+${item.shap.toFixed(4)}` : item.shap.toFixed(4)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        isPositive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isPositive ? (
                        <>
                          <ArrowUp className="w-3 h-3 text-emerald-600" /> Mendorong
                        </>
                      ) : (
                        <>
                          <ArrowDown className="w-3 h-3 text-rose-600" /> Mengurangi
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
