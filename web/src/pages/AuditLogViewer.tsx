import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Lock, ShieldCheck, ShieldAlert, RefreshCw, AlertTriangle, Key } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [tamperedMsg, setTamperedMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAuditLogs();
    verifyIntegrity();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit/logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
    setLoading(false);
  };

  const verifyIntegrity = async () => {
    try {
      const res = await api.get('/audit/verify');
      setVerifyResult(res.data);
    } catch (err) {
      console.error('Failed to verify audit ledger:', err);
    }
  };

  const handleSimulateTampering = async () => {
    try {
      const res = await api.post('/audit/tamper-demo');
      setTamperedMsg(res.data.message);
      fetchAuditLogs();
      verifyIntegrity();
    } catch (err) {
      console.error('Tampering demo failed:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="h-6 w-6 text-amber-500" />
            <span>Cryptographic SHA-256 Audit Ledger</span>
          </h1>
          <p className="text-xs text-slate-400">Immutable, parent-child hash-chained audit trail sealing every inspection, observation, and CAPA state change</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={verifyIntegrity}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Verify Integrity</span>
          </button>

          <button
            onClick={handleSimulateTampering}
            className="flex items-center space-x-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold px-3 py-2 rounded-lg transition"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span>Simulate Tampering Demo</span>
          </button>
        </div>
      </div>

      {/* Verification Status Card */}
      {verifyResult && (
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg ${
          verifyResult.is_valid
            ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
            : 'bg-rose-950/80 border-rose-800 text-rose-200 animate-pulse'
        }`}>
          <div className="flex items-center space-x-3">
            {verifyResult.is_valid ? (
              <ShieldCheck className="h-8 w-8 text-emerald-400 flex-shrink-0" />
            ) : (
              <ShieldAlert className="h-8 w-8 text-rose-400 flex-shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm">
                {verifyResult.is_valid ? 'SHA-256 Cryptographic Chain Verified' : '🚨 LEDGER TAMPERING DETECTED!'}
              </div>
              <div className="text-xs opacity-90">{verifyResult.message}</div>
            </div>
          </div>

          <div className="text-right text-xs font-mono bg-slate-950/50 p-2 rounded border border-slate-800">
            <div>Total Blocks: <b>{verifyResult.total_records}</b></div>
            <div>Tampered Blocks: <b className={verifyResult.tampered_records_count > 0 ? 'text-rose-400' : 'text-emerald-400'}>{verifyResult.tampered_records_count}</b></div>
          </div>
        </div>
      )}

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor Email</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Entity Type</th>
                <th className="p-3">Parent Hash (prev_hash)</th>
                <th className="p-3">Block Hash (current_hash)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
              {logs.map((log) => {
                const isTampered = verifyResult?.tampered_log_ids?.includes(log.id);
                return (
                  <tr key={log.id} className={`transition ${isTampered ? 'bg-rose-950/80 text-rose-200' : 'hover:bg-slate-800/50'}`}>
                    <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 text-slate-200 font-sans">{log.actor_email}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-400 border border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-sans">{log.entity_type}</td>
                    <td className="p-3 text-slate-500 max-w-[120px] truncate" title={log.prev_hash}>
                      {log.prev_hash.substring(0, 16)}...
                    </td>
                    <td className={`p-3 max-w-[140px] truncate font-bold ${isTampered ? 'text-rose-400' : 'text-emerald-400'}`} title={log.current_hash}>
                      {log.current_hash.substring(0, 16)}...
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
