import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'INSPECTOR' | 'MINE_MANAGER' | 'CONTRACTOR' | 'CORPORATE' | 'REGULATOR' | 'ADMIN';
  organization_id?: string;
  subsidiary_id?: string;
  mine_id?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: string) => Promise<void>;
}

const demoUserProfiles: Record<string, User> = {
  'inspector@coalgov.in': {
    id: 'demo-inspector-id',
    email: 'inspector@coalgov.in',
    full_name: 'Rajeswar Sharma',
    role: 'INSPECTOR'
  },
  'manager@coalgov.in': {
    id: 'demo-manager-id',
    email: 'manager@coalgov.in',
    full_name: 'Aman Verma',
    role: 'MINE_MANAGER'
  },
  'corporate@coalgov.in': {
    id: 'demo-corporate-id',
    email: 'corporate@coalgov.in',
    full_name: 'Sunita Rao',
    role: 'CORPORATE'
  },
  'regulator@coalgov.in': {
    id: 'demo-regulator-id',
    email: 'regulator@coalgov.in',
    full_name: 'DGMS Inspector Team',
    role: 'REGULATOR'
  },
  'admin@coalgov.in': {
    id: 'demo-admin-id',
    email: 'admin@coalgov.in',
    full_name: 'System Administrator',
    role: 'ADMIN'
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('coalgov_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('coalgov_token'));

  const login = async (email: string, pass: string) => {
    try {
      const res = await api.post('/auth/login', { email, password: pass });
      const { access_token, user: userData } = res.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('coalgov_token', access_token);
      localStorage.setItem('coalgov_user', JSON.stringify(userData));
    } catch (err) {
      console.warn('Network login failed or offline mode active. Utilizing local profile fallback:', err);
      // Fallback to local offline profile matching the email
      const fallbackUser = demoUserProfiles[email] || {
        id: `local-${Date.now()}`,
        email: email,
        full_name: email.split('@')[0],
        role: 'MINE_MANAGER'
      };

      const fallbackToken = 'offline-demo-jwt-token';
      setToken(fallbackToken);
      setUser(fallbackUser);
      localStorage.setItem('coalgov_token', fallbackToken);
      localStorage.setItem('coalgov_user', JSON.stringify(fallbackUser));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('coalgov_token');
    localStorage.removeItem('coalgov_user');
  };

  const quickDemoLogin = async (roleKey: string) => {
    const credentials: Record<string, { email: string; pass: string }> = {
      INSPECTOR: { email: 'inspector@coalgov.in', pass: 'inspector123' },
      MINE_MANAGER: { email: 'manager@coalgov.in', pass: 'manager123' },
      CORPORATE: { email: 'corporate@coalgov.in', pass: 'corporate123' },
      REGULATOR: { email: 'regulator@coalgov.in', pass: 'regulator123' },
      ADMIN: { email: 'admin@coalgov.in', pass: 'admin123' },
    };

    const cred = credentials[roleKey] || credentials.MINE_MANAGER;
    await login(cred.email, cred.pass);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, quickDemoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
