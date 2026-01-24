
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StationProvider } from './contexts/StationContext';
import { SocketProvider } from './contexts/SocketContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Stories from './pages/Stories';
import StoryEditor from './pages/StoryEditor';
import SidePage from './pages/SidePage';
import CentrePage from './pages/CentrePage';
import WireFeed from './pages/WireFeed';
import RundownEditor from './pages/RundownEditor';
import Shows from './pages/Shows';
import Documentation from './pages/Documentation';
import Settings from './pages/Settings';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary-600/20 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Synchronizing Cluster</div>
            <div className="text-[8px] font-bold text-slate-700 uppercase tracking-widest mt-2">Connecting to NewsVortex Node...</div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <StationProvider>
      <Layout>{children}</Layout>
    </StationProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-[10px] font-black text-primary-600 uppercase tracking-[0.5em] animate-pulse">
            Booting System...
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/workspace" element={<ProtectedRoute><SidePage /></ProtectedRoute>} />
      <Route path="/stories" element={<ProtectedRoute><Stories /></ProtectedRoute>} />
      <Route path="/wire" element={<ProtectedRoute><WireFeed /></ProtectedRoute>} />
      <Route path="/stories/new" element={<ProtectedRoute><StoryEditor /></ProtectedRoute>} />
      <Route path="/stories/:id" element={<ProtectedRoute><StoryEditor /></ProtectedRoute>} />
      <Route path="/rundown/:id" element={<ProtectedRoute><RundownEditor /></ProtectedRoute>} />
      <Route path="/shows" element={<ProtectedRoute><Shows /></ProtectedRoute>} />
      <Route path="/centre" element={<ProtectedRoute><CentrePage /></ProtectedRoute>} />
      <Route path="/docs" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        {/* Fix: Using HashRouter explicitly and ensured named exports match v6 syntax */}
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
