import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SyncProvider } from './context/SyncContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';

import { Login } from './pages/Login';
import { MineDashboard } from './pages/MineDashboard';
import { CorporateDashboard } from './pages/CorporateDashboard';
import { ComplianceRegistry } from './pages/ComplianceRegistry';
import { CapaBoard } from './pages/CapaBoard';
import { FieldInspectorPWA } from './pages/FieldInspectorPWA';
import { AuditLogViewer } from './pages/AuditLogViewer';
import { OcrDigitizer } from './pages/OcrDigitizer';
import { RegulatorDashboard } from './pages/RegulatorDashboard';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route
        path="/"
        element={
          <ProtectedLayout>
            <MineDashboard />
          </ProtectedLayout>
        }
      />

      <Route
        path="/corporate"
        element={
          <ProtectedLayout>
            <CorporateDashboard />
          </ProtectedLayout>
        }
      />

      <Route
        path="/compliance"
        element={
          <ProtectedLayout>
            <ComplianceRegistry />
          </ProtectedLayout>
        }
      />

      <Route
        path="/capas"
        element={
          <ProtectedLayout>
            <CapaBoard />
          </ProtectedLayout>
        }
      />

      <Route
        path="/map"
        element={
          <ProtectedLayout>
            <MineDashboard />
          </ProtectedLayout>
        }
      />

      <Route
        path="/ocr"
        element={
          <ProtectedLayout>
            <OcrDigitizer />
          </ProtectedLayout>
        }
      />

      <Route
        path="/audit"
        element={
          <ProtectedLayout>
            <AuditLogViewer />
          </ProtectedLayout>
        }
      />

      <Route
        path="/regulator"
        element={
          <ProtectedLayout>
            <RegulatorDashboard />
          </ProtectedLayout>
        }
      />

      <Route
        path="/mobile"
        element={
          <ProtectedLayout>
            <FieldInspectorPWA />
          </ProtectedLayout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SyncProvider>
          <AppContent />
        </SyncProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
