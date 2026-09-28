import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, Smartphone, Building2, Lock, Key } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('manager@coalgov.in');
  const [password, setPassword] = useState('manager123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError('Invalid login credentials');
    }
    setLoading(false);
  };

  const handleDemoClick = async (roleKey: string) => {
    setLoading(true);
    try {
      await quickDemoLogin(roleKey);
      if (roleKey === 'INSPECTOR') navigate('/mobile');
      else if (roleKey === 'CORPORATE') navigate('/corporate');
      else if (roleKey === 'REGULATOR') navigate('/regulator');
      else navigate('/');
    } catch (err) {
      setError('Demo login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex bg-amber-500 text-slate-950 p-3 rounded-2xl font-bold shadow-xl shadow-amber-500/20 mb-2">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            CoalGov <span className="text-amber-500">AI</span>
          </h1>
          <p className="text-xs text-slate-400">
            Smart Governance & Statutory Compliance Monitoring Platform  
            <br />
            <span className="text-slate-500 font-mono">Ministry of Coal | Coal India Limited (SIH26024)</span>
          </p>
        </div>

        {/* Quick Demo Login Personas Cards */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider text-center">
            ⚡ Quick Demo Logins (Click to Enter)
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoClick('MINE_MANAGER')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition space-y-0.5"
            >
              <div className="font-bold text-white">Mine Manager</div>
              <div className="text-[10px] text-slate-400">Mine KPIs & CAPAs</div>
            </button>

            <button
              onClick={() => handleDemoClick('INSPECTOR')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition space-y-0.5"
            >
              <div className="font-bold text-amber-400">Inspector (PWA)</div>
              <div className="text-[10px] text-slate-400">Offline Field App</div>
            </button>

            <button
              onClick={() => handleDemoClick('CORPORATE')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition space-y-0.5"
            >
              <div className="font-bold text-white">Corporate HQ</div>
              <div className="text-[10px] text-slate-400">Multi-Mine Analytics</div>
            </button>

            <button
              onClick={() => handleDemoClick('REGULATOR')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition space-y-0.5"
            >
              <div className="font-bold text-emerald-400">DGMS / Regulator</div>
              <div className="text-[10px] text-slate-400">Audit & PDF Export</div>
            </button>
          </div>
        </div>

        {/* Standard Form Login */}
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          {error && (
            <div className="bg-rose-950 border border-rose-800 text-rose-300 text-xs p-3 rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 rounded-xl text-sm transition shadow-xl shadow-amber-500/10"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

      </div>
    </div>
  );
};
