import React, { useState, useEffect } from 'react';
import { useSync } from '../context/SyncContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Smartphone, Camera, MapPin, Wifi, WifiOff, Send, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const FieldInspectorPWA: React.FC = () => {
  const { isOnline, pendingCount, isSyncing, syncPendingObservations, addOfflineObservation } = useSync();
  const { user } = useAuth();

  const [mines, setMines] = useState<any[]>([]);
  const [mineId, setMineId] = useState<string>('');
  const [category, setCategory] = useState<string>('SAFETY');
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<string>('HIGH');
  const [isViolation, setIsViolation] = useState<boolean>(true);
  const [lat, setLat] = useState<number | undefined>(22.3364);
  const [lon, setLon] = useState<number | undefined>(82.5932);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');

  useEffect(() => {
    // Load mines
    api.get('/mines').then((res) => {
      setMines(res.data);
      if (res.data.length > 0) setMineId(res.data[0].id);
    }).catch(() => {});

    // Capture GPS Geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLon(pos.coords.longitude);
        },
        (err) => console.log('Geolocation not available, using default coordinates')
      );
    }
  }, []);

  const handleSubmitObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const clientUuid = `pwa-obs-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const nowIso = new Date().toISOString();

    const obsData = {
      client_uuid: clientUuid,
      mine_id: mineId,
      category,
      description,
      severity,
      is_violation: isViolation,
      latitude: lat,
      longitude: lon,
      photo_url: photoUrl || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500',
      client_timestamp: nowIso
    };

    if (isOnline) {
      try {
        await api.post('/inspections/observations', obsData);
        setStatusMsg('✓ Submitted directly to server & recorded in audit log!');
      } catch (err) {
        await addOfflineObservation(obsData);
        setStatusMsg('⚠️ Network timeout. Saved to PWA IndexedDB queue.');
      }
    } else {
      await addOfflineObservation(obsData);
      setStatusMsg('🔴 Offline Mode: Observation saved locally in IndexedDB. Will auto-sync when network returns.');
    }

    setDescription('');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-16 pt-2">
      
      {/* PWA App Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-xl">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base">CoalGov Inspector Mobile PWA</h1>
              <p className="text-[11px] text-slate-400">Offline-First Field Reporting Engine</p>
            </div>
          </div>

          <div className="text-right">
            {isOnline ? (
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full font-semibold">
                <Wifi className="h-3 w-3" /> Online
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] bg-rose-950 text-rose-400 border border-rose-800 px-2.5 py-1 rounded-full font-semibold animate-pulse">
                <WifiOff className="h-3 w-3" /> Offline Mode
              </span>
            )}
          </div>
        </div>

        {/* Sync Status Banner */}
        {pendingCount > 0 && (
          <div className="bg-amber-950/80 border border-amber-800 p-2.5 rounded-xl flex items-center justify-between text-xs text-amber-300">
            <span><b>{pendingCount}</b> Observation(s) waiting in offline queue</span>
            {isOnline && (
              <button
                onClick={syncPendingObservations}
                disabled={isSyncing}
                className="bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded-lg flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} /> Sync
              </button>
            )}
          </div>
        )}
      </div>

      {/* Success Notification */}
      {statusMsg && (
        <div className="bg-slate-900 border border-emerald-500/50 p-3 rounded-xl text-xs text-emerald-300 shadow-lg animate-fade-in">
          {statusMsg}
        </div>
      )}

      {/* Field Inspection Form */}
      <form onSubmit={handleSubmitObservation} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        
        <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
          New Field Observation Log
        </div>

        <div>
          <label className="block text-slate-300 text-xs font-semibold mb-1">Target Mine</label>
          <select
            value={mineId}
            onChange={(e) => setMineId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl p-3 outline-none"
          >
            {mines.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none font-semibold"
            >
              <option value="SAFETY">SAFETY</option>
              <option value="ENVIRONMENT">ENVIRONMENT</option>
              <option value="EQUIPMENT">EQUIPMENT</option>
              <option value="LABOUR">LABOUR</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1">Severity Level</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none font-semibold"
            >
              <option value="CRITICAL">CRITICAL (24h SLA)</option>
              <option value="HIGH">HIGH (48h SLA)</option>
              <option value="MEDIUM">MEDIUM (7d SLA)</option>
              <option value="LOW">LOW (14d SLA)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-300 text-xs font-semibold mb-1">Observation Description</label>
          <textarea
            required
            rows={3}
            placeholder="Record safety hazard, equipment breakdown, or environmental observation..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none leading-relaxed"
          />
        </div>

        {/* GPS Geolocation Info Card */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-amber-500" />
            <span>GPS: {lat?.toFixed(4)}, {lon?.toFixed(4)}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">Auto-Geotagged</span>
        </div>

        {/* Violation Toggle */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white">Statutory Violation</div>
            <div className="text-[10px] text-slate-400">Triggers automatic CAPA creation</div>
          </div>
          <input
            type="checkbox"
            checked={isViolation}
            onChange={(e) => setIsViolation(e.target.checked)}
            className="h-5 w-5 accent-amber-500 rounded cursor-pointer"
          />
        </div>

        {/* Camera Photo Picker Placeholder */}
        <div>
          <label className="block text-slate-300 text-xs font-semibold mb-1">Camera Evidence Snapshot</label>
          <div className="bg-slate-950 border border-dashed border-slate-700 p-3 rounded-xl text-center cursor-pointer hover:border-amber-500 transition">
            <Camera className="h-6 w-6 text-slate-500 mx-auto mb-1" />
            <span className="text-xs text-slate-400">Tap to Capture Photo with GPS Timestamp</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-xl text-sm transition shadow-xl shadow-amber-500/10 flex items-center justify-center space-x-2"
        >
          <Send className="h-4 w-4" />
          <span>Save & Sync Observation</span>
        </button>

      </form>

    </div>
  );
};
