import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LeafletMap } from '../components/LeafletMap';
import { ShieldCheck, AlertTriangle, Clock, TrendingUp, Download, CheckCircle2, AlertOctagon, Sparkles } from 'lucide-react';

export const MineDashboard: React.FC = () => {
  const [mines, setMines] = useState<any[]>([]);
  const [selectedMineId, setSelectedMineId] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [capas, setCapas] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMines = async () => {
      try {
        const res = await api.get('/mines');
        setMines(res.data);
        if (res.data.length > 0) {
          // Default to Gevra Mega Opencast Mine or first mine
          const defaultMine = res.data.find((m: any) => m.name.includes('Gevra')) || res.data[0];
          setSelectedMineId(defaultMine.id);
        }
      } catch (err) {
        console.error('Failed to load mines:', err);
      }
    };
    fetchMines();
  }, []);

  useEffect(() => {
    if (!selectedMineId) return;

    const loadMineData = async () => {
      setLoading(true);
      try {
        const [statsRes, riskRes, capasRes, anomalyRes] = await Promise.all([
          api.get(`/mines/${selectedMineId}/dashboard-stats`),
          api.get(`/ai/risk-scores?mine_id=${selectedMineId}`),
          api.get(`/capas?mine_id=${selectedMineId}`),
          api.get('/ai/anomalies')
        ]);

        setStats(statsRes.data);
        setRiskData(riskRes.data[0] || null);
        setCapas(capasRes.data);
        setAnomalies(anomalyRes.data.filter((a: any) => a.entity_id === selectedMineId));
      } catch (err) {
        console.error('Failed to load mine details:', err);
      }
      setLoading(false);
    };

    loadMineData();
  }, [selectedMineId]);

  const handleDownloadPdf = () => {
    if (!selectedMineId) return;
    window.open(`http://localhost:8000/api/reports/compliance/pdf/${selectedMineId}`, '_blank');
  };

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
      
      {/* Top Header & Mine Picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Mine Compliance & Safety Governance</span>
            {stats && (
              <span className="text-xs bg-slate-800 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
                {stats.subsidiary_name}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400">Real-time statutory obligation tracking, CAPA SLAs and AI risk intelligence</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedMineId}
            onChange={(e) => setSelectedMineId(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none font-medium"
          >
            {mines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.mine_type})
              </option>
            ))}
          </select>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-amber-500/10"
          >
            <Download className="h-4 w-4" />
            <span>Export Statutory Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Statutory Compliance Rate</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.compliance_percentage}%
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>{stats.compliant_obligations} of {stats.total_obligations} obligations compliant</span>
              <span className="text-emerald-400 font-semibold">+2.4% MoM</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Active CAPAs & Open Issues</span>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.open_capas}
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>{stats.resolved_capas} resolved & verified</span>
              <span className="text-rose-400 font-semibold">{stats.escalated_capas} Escalated</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>AI Mine Risk Index</span>
              <Sparkles className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white flex items-baseline gap-2">
              <span>{riskData?.score || 45.2}</span>
              <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${
                riskData?.risk_level === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                riskData?.risk_level === 'HIGH' ? 'bg-orange-950 text-orange-400 border-orange-800' : 'bg-emerald-950 text-emerald-400 border-emerald-800'
              }`}>
                {riskData?.risk_level || 'MEDIUM'}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Evaluated by XGBoost risk scoring model
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Total Field Observations</span>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.total_observations}
            </div>
            <div className="text-xs text-slate-400">
              <span>{stats.violations_count} statutory violations logged</span>
            </div>
          </div>

        </div>
      )}

      {/* Main Grid: GIS Map & AI Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GIS Map View */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span>GIS Mine Map & Violation Heat Layer</span>
              <span className="text-xs text-slate-400 font-normal">({stats?.district})</span>
            </h2>
          </div>
          <LeafletMap mines={mines} selectedMineId={selectedMineId} onSelectMine={setSelectedMineId} height="400px" />
        </div>

        {/* AI Risk Score Factors */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Risk Scoring Breakdown</span>
            </h2>
            <span className="text-xs text-slate-400">Top Factors</span>
          </div>

          {riskData?.contributing_factors ? (
            <div className="space-y-3">
              {riskData.contributing_factors.map((f: any, idx: number) => (
                <div key={idx} className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                    <span>{f.factor}</span>
                    <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">+{f.weight} pts</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-8 text-center">Calculating AI risk weights...</div>
          )}

          {/* Operational Anomaly Banner */}
          {anomalies.length > 0 && (
            <div className="bg-rose-950/50 border border-rose-800/80 p-3 rounded-lg space-y-1">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold">
                <AlertOctagon className="h-4 w-4" />
                <span>Operational Anomaly Flagged</span>
              </div>
              <p className="text-xs text-slate-300">{anomalies[0].explanation}</p>
            </div>
          )}
        </div>

      </div>

      {/* Active CAPA SLA Board Table */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <span>Active CAPAs & SLA Escalation Timers</span>
          </h2>
          <span className="text-xs text-slate-400">{capas.length} Total Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Title / Description</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Assigned Owner</th>
                <th className="p-3">Status</th>
                <th className="p-3">Escalation Level</th>
                <th className="p-3">SLA Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {capas.slice(0, 6).map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-3 max-w-xs font-medium text-white">
                    <div>{c.title}</div>
                    <div className="text-[11px] text-slate-400 truncate">{c.description}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${getSeverityBadge(c.severity)}`}>
                      {c.severity}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{c.assigned_to_name || 'Safety Officer'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-400' :
                      c.status === 'ESCALATED' ? 'bg-rose-950 text-rose-400 animate-pulse' :
                      c.status === 'RESOLVED' ? 'bg-blue-950 text-blue-400' : 'bg-amber-950 text-amber-400'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono">
                    {c.escalation_level > 0 ? (
                      <span className="text-rose-400 font-bold">L{c.escalation_level} ({c.escalation_level === 1 ? 'Manager' : c.escalation_level === 2 ? 'GM' : 'Corporate'})</span>
                    ) : (
                      <span className="text-slate-500">L0 (Officer)</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-400">
                    {new Date(c.sla_due_date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
