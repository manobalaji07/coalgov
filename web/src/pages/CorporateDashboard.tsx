import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { LeafletMap } from '../components/LeafletMap';
import { Building2, AlertTriangle, Sparkles, ShieldAlert, BarChart3, Layers } from 'lucide-react';

export const CorporateDashboard: React.FC = () => {
  const [mines, setMines] = useState<any[]>([]);
  const [riskScores, setRiskScores] = useState<any[]>([]);
  const [recurringClusters, setRecurringClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [minesRes, riskRes, clustersRes] = await Promise.all([
          api.get('/mines'),
          api.get('/ai/risk-scores'),
          api.get('/ai/recurring-violations')
        ]);
        setMines(minesRes.data);
        setRiskScores(riskRes.data);
        setRecurringClusters(clustersRes.data);
      } catch (err) {
        console.error('Failed to load corporate data:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Merge mine details with risk scores
  const mergedMines = mines.map((m) => {
    const scoreObj = riskScores.find((r) => r.entity_id === m.id);
    return {
      ...m,
      risk_score: scoreObj ? scoreObj.score : 45.0,
      risk_level: scoreObj ? scoreObj.risk_level : 'MEDIUM',
      factors: scoreObj ? scoreObj.contributing_factors : []
    };
  }).sort((a, b) => b.risk_score - a.risk_score);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-amber-500" />
            <span>Corporate HQ — Executive Compliance & Risk Control</span>
          </h1>
          <p className="text-xs text-slate-400">Multi-subsidiary governance benchmarking, nationwide GIS risk heatmap, and AI recurring failure insights</p>
        </div>
        <div className="bg-slate-950 border border-slate-800 text-xs px-3 py-1.5 rounded-lg text-amber-400 font-mono">
          Coverage: 3 Subsidiaries | 8 Open & Underground Mines
        </div>
      </div>

      {/* Main Grid: National Map & Risk Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GIS Map */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-500" />
              <span>National Coal Field GIS Risk Heatmap</span>
            </h2>
          </div>
          <LeafletMap mines={mergedMines} height="440px" />
        </div>

        {/* Highest Risk Mines Ranking */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              <span>Mine Risk Index Ranking</span>
            </h2>
            <span className="text-xs text-slate-400">High to Low</span>
          </div>

          <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
            {mergedMines.map((m, idx) => (
              <div key={m.id} className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="text-slate-500 text-[10px]">#{idx + 1}</span>
                    <span>{m.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {m.code} | {m.district}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-white font-mono">{m.risk_score}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                    m.risk_level === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                    m.risk_level === 'HIGH' ? 'bg-orange-950 text-orange-400 border-orange-800' : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}>
                    {m.risk_level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* NLP Recurring Failure Clusters Section */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>AI Recurring Safety Failure Clusters & Root Cause Analysis</span>
          </h2>
          <span className="text-xs text-slate-400">NLP Text Clustering over 150+ observations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recurringClusters.map((cluster) => (
            <div key={cluster.cluster_id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                  Cluster #{cluster.cluster_id}
                </span>
                <span className="text-xs text-slate-400 font-mono">{cluster.violation_count} Occurrences</span>
              </div>

              <h3 className="text-sm font-bold text-white">{cluster.topic_label}</h3>

              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400">Sample Field Observations:</div>
                <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                  {cluster.sample_descriptions.map((desc: string, i: number) => (
                    <li key={i} className="truncate">{desc}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg space-y-0.5">
                <div className="text-[11px] font-semibold text-purple-400">Suggested Root Cause:</div>
                <div className="text-xs text-slate-300">{cluster.suggested_root_cause}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
