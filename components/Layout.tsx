import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useStation } from '../contexts/StationContext';
import { UserRole } from '../types';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { currentStation, stations, setCurrentStation } = useStation();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { path: '/workspace', label: 'Work', icon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
    { path: '/stories', label: 'Stories', icon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
    { path: '/wire', label: 'Wire', icon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    { path: '/centre', label: 'Centre', icon: (props: any) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> }
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case UserRole.EDITOR: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col print:bg-white relative overflow-x-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-2xl sticky top-0 z-[60] print:hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-4 md:gap-10">
              <Link to="/dashboard" className="flex items-center gap-3 shrink-0">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/30">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l2 2h5a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
                </div>
                <span className="text-sm md:text-xl font-black tracking-tighter uppercase whitespace-nowrap">HATMANN <span className="text-primary-500 hidden sm:inline">NewsVortex</span></span>
              </Link>
              
              <nav className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                      isActive(item.path)
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              {stations.length > 0 && (
                <div className="relative group max-w-[100px] md:max-w-none">
                  <select
                    value={currentStation?.id || ''}
                    onChange={(e) => {
                      const station = stations.find((s) => s.id === e.target.value);
                      if (station) setCurrentStation(station);
                    }}
                    className="bg-white/5 text-white/80 pl-3 pr-8 py-2 md:pl-4 md:pr-10 md:py-2.5 rounded-lg md:rounded-xl border border-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none cursor-pointer w-full"
                  >
                    {stations.map((s) => (
                      <option key={s.id} value={s.id} className="bg-slate-900">
                        {s.callSign}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 md:gap-4 pl-3 md:pl-6 border-l border-white/10">
                <div className="text-right hidden xl:block">
                  <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1">{user?.firstName} {user?.lastName}</p>
                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role || 'Guest'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="w-8 h-8 md:w-10 md:h-10 bg-white/5 rounded-lg md:rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all group"
                  title="Logout"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow py-6 md:py-10 pb-24 lg:pb-10 container mx-auto px-4 md:px-6 print:p-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-2 py-3 z-[60] shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-1 transition-all relative ${
                  active ? 'text-primary-500' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <item.icon className={`w-5 h-5 ${active ? 'animate-in zoom-in-75 duration-300' : ''}`} />
                <span className="text-[7px] font-black uppercase tracking-widest">{item.label}</span>
                {active && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-primary-500 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Global Status Bar - Visible only on large screens */}
      <footer className="hidden lg:block bg-white border-t border-slate-100 py-3 px-6 print:hidden">
        <div className="container mx-auto flex justify-between items-center text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Node Linked</span>
            <span>Station: {currentStation?.callSign}</span>
            <Link to="/docs" className="hover:text-primary-600 transition-colors border-l border-slate-200 pl-4">Manual</Link>
          </div>
          <div className="flex gap-4">
             <span>v3.5 Cluster</span>
             <span className="text-slate-200">|</span>
             <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}