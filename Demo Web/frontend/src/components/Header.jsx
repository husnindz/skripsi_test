import React from 'react';
import { Activity, ShieldCheck, Sparkles, Cpu } from 'lucide-react';

export default function Header({ health }) {
  const isOnline = health && health.status === 'healthy';
  const isModelLoaded = health && health.model_loaded;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[#146178]/15 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#146178] to-[#0f4a5c] flex items-center justify-center shadow-md shadow-[#146178]/20 shrink-0">
              <Activity className="w-6 h-6 text-[#77F9D0]" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-montserrat font-bold text-2xl tracking-tight text-[#146178]">
                  Aether<span className="text-[#0ea5e9]">Med</span>
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase bg-[#EDFBFF] text-[#146178] border border-[#146178]/20 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#146178]" /> Conformer XAI
                </span>
              </div>
              <p className="text-xs text-[#5C7076] font-medium font-poppins">
                Medical Check-up Screening & Explainable AI Visualization Prototype
              </p>
            </div>
          </div>

          {/* Engine Status Badges */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FDFF] border border-[#146178]/15 text-xs text-[#146178] font-medium shadow-2xs">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span>{isOnline ? 'Backend Online' : 'Connecting...'}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EDFBFF] border border-[#146178]/20 text-xs text-[#146178] font-semibold">
              <Cpu className="w-3.5 h-3.5 text-[#146178]" />
              <span>
                {isModelLoaded ? 'Conformer Weights Active' : 'Simulation Engine Mode'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
