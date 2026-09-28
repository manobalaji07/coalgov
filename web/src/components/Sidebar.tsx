import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, ClipboardList, AlertTriangle, Map, FileText, Lock, ShieldAlert, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const links = [
    { to: '/', label: 'Mine Dashboard', icon: LayoutDashboard, roles: ['MINE_MANAGER', 'INSPECTOR', 'ADMIN'] },
    { to: '/corporate', label: 'Corporate HQ View', icon: Building2, roles: ['CORPORATE', 'ADMIN'] },
    { to: '/compliance', label: 'Compliance Registry', icon: ClipboardList, roles: ['ALL'] },
    { to: '/capas', label: 'CAPA Board & SLAs', icon: AlertTriangle, roles: ['ALL'] },
    { to: '/map', label: 'GIS Risk Map', icon: Map, roles: ['ALL'] },
    { to: '/ocr', label: 'OCR Digitizer', icon: FileText, roles: ['MINE_MANAGER', 'ADMIN'] },
    { to: '/audit', label: 'Cryptographic Ledger', icon: Lock, roles: ['ALL'] },
    { to: '/regulator', label: 'Regulator / DGMS', icon: ShieldAlert, roles: ['REGULATOR', 'ADMIN', 'CORPORATE'] },
    { to: '/mobile', label: 'Mobile PWA App', icon: Smartphone, roles: ['ALL'] },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col min-h-[calc(100vh-4rem)] p-4">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
        Navigation
      </div>
      <nav className="space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-800 text-[11px] text-slate-500">
        <div className="font-semibold text-slate-400">CoalGov AI v1.0.0</div>
        <div>Ministry of Coal | CIL</div>
      </div>
    </aside>
  );
};
