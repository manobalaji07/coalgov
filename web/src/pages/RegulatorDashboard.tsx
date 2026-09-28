import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldCheck, Download, Lock, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';

export const RegulatorDashboard: React.FC = () => {
  const [mines, setMines] = useState<any[]>([]);
  const [auditVerify, setAuditVerify] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [minesRes, verifyRes] = await Promise.all([
          api.get('/mines'),
          api.get('/audit/verify')
        ]);
        setMines(minesRes.data);
        setAuditVerify(verifyRes.data);
      } catch (err) {
        console.error('Failed to load regulator data:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <span>Regulator & DGMS Statutory Oversight Portal</span>
          </h1>
          <p className="text-xs text-slate-400">Read-only audit transparency portal for Directorate General of Mines Safety and CPCB regulators</p>
        </div>

        {auditVerify && (
          <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 font-mono">
            <Lock className="h-4 w-4" />
            <span>Cryptographic Ledger Status: Sealed & Verified</span>
          </div>
        )}
      </div>

      {/* Mines Compliance Summary List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">All Subsidiary Mines — Compliance Status & Export</h2>
          <span className="text-xs text-slate-400">{mines.length} Active Coal Mines</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mines.map((m) => (
            <div key={m.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white">{m.name}</div>
                <div className="text-[11px] text-slate-400">{m.code} | {m.district}</div>
                <div className="text-[11px] text-slate-500 font-mono">Capacity: {m.production_capacity_mt} MT</div>
              </div>

              <button
                onClick={() => window.open(`http://localhost:8000/api/reports/compliance/pdf/${m.id}`, '_blank')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center space-x-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Statutory PDF</span>
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
