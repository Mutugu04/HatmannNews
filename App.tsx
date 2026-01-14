import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Node Sync...</div>
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-primary-600 font-black uppercase tracking-[0.5em] animate-pulse">
        Synchronizing Engine...
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
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}