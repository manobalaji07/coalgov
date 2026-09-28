import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          <span className="font-semibold text-slate-400">CoalGov AI</span> — Smart Governance & Compliance Platform for Coal Mines (SIH26024)
        </div>
        <div className="bg-slate-900 border border-slate-800 text-amber-500 px-3 py-1 rounded text-[11px] font-mono">
          ⚠️ Demo Notice: All data shown is realistic synthetic data generated for SIH 2026 evaluation.
        </div>
      </div>
    </footer>
  );
};
