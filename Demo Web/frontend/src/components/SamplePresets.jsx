import React, { useRef } from 'react';
import { SAMPLE_PATIENTS } from '../utils/samples';
import {
  HeartPulse,
  Stethoscope,
  Wind,
  CheckCircle2,
  UserCheck,
  FilePlus2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function SamplePresets({
  activeSampleId,
  onSelectSample,
  onSelectNewInput,
}) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const getIcon = (id) => {
    switch (id) {
      case 'new-input':
        return <FilePlus2 className="w-4 h-4 text-[#146178]" />;
      case 'sample-sehat':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'sample-jantung':
        return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'sample-penyakit-dalam':
        return <Stethoscope className="w-4 h-4 text-amber-600" />;
      case 'sample-paru':
        return <Wind className="w-4 h-4 text-sky-600" />;
      default:
        return <UserCheck className="w-4 h-4 text-[#146178]" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#146178]/15 shadow-sm text-left">
      {/* Title & Navigation controls */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-montserrat font-bold text-sm text-[#146178] flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#146178]" />
            Preset Profil Pasien Uji & Input Baru
          </h3>
          <p className="text-xs text-[#5C7076] font-poppins">
            Pilih sampel data klinis riil atau buat input nilai laboratorium baru
          </p>
        </div>

        {/* Scroll Arrows */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="w-7 h-7 rounded-lg border border-[#146178]/20 bg-[#F8FDFF] hover:bg-[#EDFBFF] text-[#146178] flex items-center justify-center transition-colors cursor-pointer"
            title="Geser ke kiri"
            aria-label="Geser ke kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="w-7 h-7 rounded-lg border border-[#146178]/20 bg-[#F8FDFF] hover:bg-[#EDFBFF] text-[#146178] flex items-center justify-center transition-colors cursor-pointer"
            title="Geser ke kanan"
            aria-label="Geser ke kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Menu Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto pb-2 scroll-smooth select-none scrollbar-thin"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#b2d7e0 transparent',
        }}
      >
        {/* Menu Item 1: Input Nilai Baru */}
        <button
          type="button"
          onClick={onSelectNewInput}
          className={`shrink-0 w-[240px] sm:w-[250px] text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
            activeSampleId === 'new-input'
              ? 'bg-[#EDFBFF] border-[#146178] shadow-sm ring-1 ring-[#146178]'
              : 'bg-[#F8FDFF] border-[#146178]/15 hover:border-[#146178]/40 hover:bg-[#EDFBFF]/60'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1.5 rounded-lg bg-white shadow-2xs border border-[#146178]/10">
              {getIcon('new-input')}
            </div>
            <span className="font-montserrat font-bold text-xs text-[#146178]">
              Input Nilai Baru
            </span>
          </div>
          <p className="text-[11px] text-[#5C7076] font-poppins leading-relaxed">
            Kosongkan formulir untuk memasukkan 13 nilai parameter pasien baru secara manual
          </p>
        </button>

        {/* Preset Samples */}
        {SAMPLE_PATIENTS.map((sample) => {
          const isSelected = activeSampleId === sample.id;
          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample)}
              className={`shrink-0 w-[240px] sm:w-[250px] text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-[#EDFBFF] border-[#146178] shadow-sm ring-1 ring-[#146178]'
                  : 'bg-[#F8FDFF] border-[#146178]/15 hover:border-[#146178]/40 hover:bg-[#EDFBFF]/60'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-lg bg-white shadow-2xs border border-[#146178]/10">
                  {getIcon(sample.id)}
                </div>
                <span className="font-montserrat font-semibold text-xs text-[#146178] truncate">
                  {sample.name}
                </span>
              </div>
              <p className="text-[11px] text-[#5C7076] font-poppins leading-relaxed line-clamp-2">
                {sample.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
