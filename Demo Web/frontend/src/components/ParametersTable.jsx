import React from 'react';

export const LAB_PARAMETERS = [
  {
    key: 'cholesterol total',
    name: 'Cholesterol Total',
    unit: 'mg/dL',
    min: 0,
    max: 200,
    reference: '0 - 200 mg/dL',
  },
  {
    key: 'creatinin',
    name: 'Creatinin',
    unit: 'mg/dL',
    min: 0.6,
    max: 1.1,
    reference: '0.6 - 1.1 mg/dL',
  },
  {
    key: 'fbs',
    name: 'FBS (Gula Darah Puasa)',
    unit: 'mg/dL',
    min: 70,
    max: 100,
    reference: '70 - 100 mg/dL',
  },
  {
    key: 'rbs',
    name: 'RBS (Gula Darah Sewaktu)',
    unit: 'mg/dL',
    min: 70,
    max: 110,
    reference: '70 - 110 mg/dL',
  },
  {
    key: 'hgb',
    name: 'Hgb (Hemoglobin)',
    unit: 'g/dL',
    min: 12,
    max: 16,
    reference: '12 - 16 g/dL',
  },
  {
    key: 'lymfosit%',
    name: 'Lymfosit %',
    unit: '%',
    min: 20,
    max: 35,
    reference: '20 - 35 %',
  },
  {
    key: 'mch',
    name: 'MCH',
    unit: 'pg',
    min: 27,
    max: 34,
    reference: '27 - 34 pg',
  },
  {
    key: 'mchc',
    name: 'MCHC',
    unit: 'g/dL',
    min: 32,
    max: 36,
    reference: '32 - 36 g/dL',
  },
  {
    key: 'mcv',
    name: 'MCV',
    unit: 'fL',
    min: 80,
    max: 100,
    reference: '80 - 100 fL',
  },
  {
    key: 'ureum',
    name: 'Ureum',
    unit: 'mg/dL',
    min: 17,
    max: 43,
    reference: '17 - 43 mg/dL',
  },
  {
    key: 'wbc',
    name: 'WBC',
    unit: '10³/µL',
    min: 4,
    max: 11,
    reference: '4 - 11 10³/µL',
  },
];

export default function ParametersTable({ formData }) {
  if (!formData) return null;

  const checkStatus = (val, min, max) => {
    const num = parseFloat(val);
    if (isNaN(num)) return { text: '-', color: 'bg-slate-200 text-slate-700' };
    if (num < min) {
      return { text: 'Rendah', color: 'bg-[#F2C039] text-[#836512]' };
    }
    if (num > max) {
      return { text: 'Tinggi', color: 'bg-[#EB5050] text-white' };
    }
    return { text: 'Normal', color: 'bg-[#17ADBD] text-white' };
  };

  return (
    <div className="w-full bg-[#EDFBFF] border border-[#AFAFAF]/20 rounded-[20px] shadow-[0px_4px_16px_rgba(20,97,120,0.06)] flex flex-col overflow-hidden text-left">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#AFAFAF]/20">
        <h3 className="font-montserrat font-bold text-xl sm:text-2xl text-[#146178]">
          Detail Parameter Anda
        </h3>
        <p className="font-poppins font-normal text-xs sm:text-sm text-[#777777] mt-1">
          Perbandingan hasil lab Anda dengan nilai rujukan normal.
        </p>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-[#D9F6FF] h-[48px] border-b border-[#AFAFAF]/20">
              <th className="w-[32%] text-[#146178] text-xs sm:text-sm font-montserrat font-semibold py-3 px-4 sm:px-6 text-left">
                Parameter
              </th>
              <th className="w-[24%] text-[#146178] text-xs sm:text-sm font-montserrat font-semibold py-3 px-4 text-center">
                Hasil Anda
              </th>
              <th className="w-[20%] text-[#146178] text-xs sm:text-sm font-montserrat font-semibold py-3 px-4 text-center">
                Status
              </th>
              <th className="w-[24%] text-[#146178] text-xs sm:text-sm font-montserrat font-semibold py-3 px-4 sm:px-6 text-right">
                Nilai Rujukan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#AFAFAF]/15 bg-white font-poppins text-xs sm:text-sm">
            {LAB_PARAMETERS.map((param) => {
              const rawVal = formData[param.key];
              const numVal = parseFloat(rawVal);
              const displayVal = !isNaN(numVal) ? numVal : '-';
              const status = checkStatus(rawVal, param.min, param.max);

              return (
                <tr key={param.key} className="hover:bg-[#F8FDFF] transition-colors h-[48px]">
                  <td className="py-2.5 px-4 sm:px-6 font-medium text-slate-800 text-left">
                    {param.name}
                  </td>
                  <td className="py-2.5 px-4 font-montserrat font-semibold text-slate-900 text-center">
                    {displayVal} <span className="text-[11px] font-normal text-slate-500">{param.unit}</span>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`inline-block px-3.5 py-0.5 rounded-full text-xs font-semibold shadow-2xs min-w-[72px] ${status.color}`}
                    >
                      {status.text}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 sm:px-6 font-poppins text-slate-500 text-right text-xs">
                    {param.reference}
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
