import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStation } from '../contexts/StationContext';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { currentStation, stations, setCurrentStation } = useStation();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard2' },
    { path: '/workspace', label: 'My Workspace' },
    { path: '/stories', label: 'All Stories' },
    { path: '/wire', label: 'Wire Feeds' },
    { path: '/shows', label: 'Shows' },
    { path: '/centre', label: 'Centre Page' },
    { path: '/settings', label: 'Settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col print:bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-2xl relative z-50 print:hidden">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-10">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l2 2h5a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
                </div>
                <span className="text-xl font-black tracking-tighter uppercase">HATMANN <span className="text-primary-500">NewsVortex</span></span>
              </Link>
              
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                      isActive(item.path)
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-6">
              {/* Station Selector */}
              {stations.length > 0 && (
                <div className="relative group">
                  <select
                    value={currentStation?.id || ''}
                    onChange={(e) => {
                      const station = stations.find((s) => s.id === e.target.value);
                      if (station) setCurrentStation(station);
                    }}
                    aria-label="Select station"
                    className="bg-white/5 text-white pl-4 pr-10 py-2.5 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all appearance-none cursor-pointer"
                  >
                    {stations.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900">
                        {s.callSign} • {s.city}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/60" aria-hidden="true">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest leading-none">Editor-in-Chief</p>
                </div>
                <button
                  onClick={logout}
                  className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all group focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                  aria-label="Log out of your account"
                >
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-10 px-6 print:p-0">
        {children}
      </main>

      {/* Global Status Bar */}
      <footer className="bg-white border-t border-slate-100 py-3 px-6 print:hidden" role="contentinfo">
        <div className="container mx-auto flex justify-between items-center text-xs font-black uppercase tracking-[0.2em] text-slate-600">
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" aria-hidden="true"></span>
              <span className="sr-only">Status:</span> NewsVortex Node Active
            </span>
            <span className="hidden sm:inline">Broadcasting to {currentStation?.callSign} frequency</span>
            <Link to="/docs" className="hover:text-primary-600 transition-colors border-l border-slate-200 pl-4 ml-2 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">System Manual & Documentation</Link>
          </div>
          <div className="flex gap-4">
             <span>v3.2 NewsVortex Engine</span>
             <span className="text-slate-300" aria-hidden="true">|</span>
             <span aria-live="polite">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}