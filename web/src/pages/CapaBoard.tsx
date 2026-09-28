import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertTriangle, CheckCircle2, ShieldCheck, Clock, ArrowUpRight, Upload, X } from 'lucide-react';

export const CapaBoard: React.FC = () => {
  const [capas, setCapas] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [selectedCapa, setSelectedCapa] = useState<any>(null);
  const [proofText, setProofText] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCapas();
  }, []);

  const fetchCapas = async () => {
    try {
      const res = await api.get('/capas');
      setCapas(res.data);
    } catch (err) {
      console.error('Failed to load CAPAs:', err);
    }
    setLoading(false);
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCapa) return;

    try {
      await api.post(`/capas/${selectedCapa.id}/resolve`, {
        proof_description: proofText,
        proof_photo_url: proofUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500'
      });
      setSelectedCapa(null);
      setProofText('');
      setProofUrl('');
      fetchCapas();
    } catch (err) {
      console.error('Resolution failed:', err);
    }
  };

  const handleVerify = async (capaId: string) => {
    try {
      await api.post(`/capas/${capaId}/verify`);
      fetchCapas();
    } catch (err) {
      console.error('Verification failed:', err);
    }
  };

  const filteredCapas = capas.filter(c => {
    if (activeTab === 'OPEN') return c.status === 'OPEN' || c.status === 'IN_PROGRESS';
    if (activeTab === 'ESCALATED') return c.status === 'ESCALATED';
    if (activeTab === 'RESOLVED') return c.status === 'RESOLVED';
    if (activeTab === 'VERIFIED') return c.status === 'VERIFIED';
    return true;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-rose-950 text-rose-400 border-rose-800';
      case 'HIGH': return 'bg-orange-950 text-orange-400 border-orange-800';
      case 'MEDIUM': return 'bg-amber-950 text-amber-400 border-amber-800';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <span>CAPA Workflow Board & SLA Timers</span>
          </h1>
          <p className="text-xs text-slate-400">Corrective Action Plans automatically triggered on safety violations with multi-level SLA escalation</p>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {['ALL', 'OPEN', 'ESCALATED', 'RESOLVED', 'VERIFIED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded font-semibold transition ${
                activeTab === tab ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* CAPA Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCapas.map((c) => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 shadow-lg flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(c.severity)}`}>
                  {c.severity}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  c.status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  c.status === 'ESCALATED' ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse' :
                  c.status === 'RESOLVED' ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {c.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white leading-snug">{c.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{c.description}</p>

              {/* Escalation Level Banner */}
              {c.escalation_level > 0 && (
                <div className="bg-rose-950/60 border border-rose-800/80 p-2 rounded text-[11px] text-rose-300 font-semibold flex items-center justify-between">
                  <span>🚨 Escalated to Level {c.escalation_level} ({c.escalation_level === 1 ? 'Mine Manager' : c.escalation_level === 2 ? 'General Manager' : 'Corporate HQ'})</span>
                </div>
              )}

              {/* Proof section if resolved */}
              {c.proof_description && (
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase">Remediation Proof Submitted:</div>
                  <div className="text-xs text-slate-300">{c.proof_description}</div>
                </div>
              )}
            </div>

            {/* Footer Metadata & Actions */}
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Assigned: <b>{c.assigned_to_name || 'Safety Officer'}</b></span>
                <span className="font-mono text-[11px]">Due: {new Date(c.sla_due_date).toLocaleDateString()}</span>
              </div>

              {c.status === 'OPEN' || c.status === 'ESCALATED' ? (
                <button
                  onClick={() => setSelectedCapa(c)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-1.5 rounded transition flex items-center justify-center space-x-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Submit Remediation Proof</span>
                </button>
              ) : c.status === 'RESOLVED' ? (
                <button
                  onClick={() => handleVerify(c.id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded transition flex items-center justify-center space-x-1.5"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verify & Close CAPA</span>
                </button>
              ) : (
                <div className="text-center text-emerald-400 font-semibold text-xs py-1">
                  ✓ Verified & Closed
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Resolution Proof Upload Modal */}
      {selectedCapa && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Upload Remediation Proof</h2>
              <button onClick={() => setSelectedCapa(null)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="font-bold text-white">{selectedCapa.title}</div>
              <div>{selectedCapa.description}</div>
            </div>

            <form onSubmit={handleResolve} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Proof Explanation / Action Taken</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Replaced damaged trailing cable with certified 3.3kV armored cable. Dielectric test passed."
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Proof Photo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded outline-none font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setSelectedCapa(null)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded hover:bg-amber-600">Submit for Verification</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
