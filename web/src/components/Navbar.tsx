import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { ShieldCheck, Wifi, WifiOff, RefreshCw, UserCheck, Smartphone, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, quickDemoLogin, logout } = useAuth();
  const { isOnline, pendingCount, isSyncing, syncPendingObservations } = useSync();
  const navigate = useNavigate();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-amber-500 text-slate-950 p-2 rounded-lg font-bold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wide text-white">CoalGov <span className="text-amber-500">AI</span></span>
              <span className="hidden sm:inline-block text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded ml-2 font-mono">
                SIH26024 | CIL
              </span>
            </div>
          </div>

          {/* Quick Demo Personas Bar */}
          <div className="hidden lg:flex items-center space-x-1 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold px-2">Demo Roles:</span>
            <button
              onClick={() => quickDemoLogin('INSPECTOR')}
              className={`px-2.5 py-1 rounded font-medium transition ${user?.role === 'INSPECTOR' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              Inspector (PWA)
            </button>
            <button
              onClick={() => quickDemoLogin('MINE_MANAGER')}
              className={`px-2.5 py-1 rounded font-medium transition ${user?.role === 'MINE_MANAGER' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              Mine Manager
            </button>
            <button
              onClick={() => quickDemoLogin('CORPORATE')}
              className={`px-2.5 py-1 rounded font-medium transition ${user?.role === 'CORPORATE' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              Corporate HQ
            </button>
            <button
              onClick={() => quickDemoLogin('REGULATOR')}
              className={`px-2.5 py-1 rounded font-medium transition ${user?.role === 'REGULATOR' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              Regulator / DGMS
            </button>
          </div>

          {/* Right Status Actions */}
          <div className="flex items-center space-x-3">
            
            {/* Mobile View Toggle */}
            <button
              onClick={() => navigate('/mobile')}
              className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg border border-amber-500/30 transition"
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">PWA Field Mode</span>
            </button>

            {/* Offline / Sync Status Badge */}
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <span className="flex items-center space-x-1.5 text-xs bg-emerald-950/80 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-800">
                  <Wifi className="h-3.5 w-3.5" />
                  <span>Online</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1.5 text-xs bg-rose-950/80 text-rose-400 px-2.5 py-1 rounded-full border border-rose-800 animate-pulse">
                  <WifiOff className="h-3.5 w-3.5" />
                  <span>Offline ({pendingCount} Queued)</span>
                </span>
              )}

              {pendingCount > 0 && isOnline && (
                <button
                  onClick={syncPendingObservations}
                  disabled={isSyncing}
                  className="flex items-center space-x-1 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-2.5 py-1 rounded-full transition"
                >
                  <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync ({pendingCount})</span>
                </button>
              )}
            </div>

            {/* User Profile */}
            {user && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-white">{user.full_name}</div>
                  <div className="text-[10px] text-amber-400 font-mono">{user.role}</div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
