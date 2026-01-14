
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LiveEvent {
  id: string;
  type: 'SYNC' | 'USER' | 'STORY';
  msg: string;
  time: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [liveFeed, setLiveFeed] = useState<LiveEvent[]>([
    { id: '1', type: 'SYNC', msg: 'System node heartbeat received', time: 'Just now' },
    { id: '2', type: 'USER', msg: 'Editor john.d connected', time: '2m ago' },
    { id: '3', type: 'STORY', msg: 'New Story Draft: Paris Summit', time: '5m ago' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const events: LiveEvent[] = [
        { id: Date.now().toString(), type: 'SYNC', msg: 'Cluster capacity verified', time: 'Just now' },
        { id: Date.now().toString(), type: 'STORY', msg: 'Broadcast Rundown updated', time: 'Just now' }
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setLiveFeed(prev => [randomEvent, ...prev.slice(0, 4)]);
    }, 10000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-100">
            <span className="inline-block px-4 py-1.5 bg-green-500/10 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">System Status: Nominal</span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 uppercase">Welcome back, {user?.firstName}.</h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl">
              The HATMANN NewsVortex is fully synchronized. Monitor editorial streams and broadcast new intelligence globally via the NewsVortex cluster.
            </p>
            
            <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-6">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Identity</p>
                  <p className="text-slate-900 font-bold mono text-sm">{user?.email}</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Real-time Intelligence Feed</h3>
                <div className="space-y-4">
                   {liveFeed.map(event => (
                     <div key={event.id} className="flex gap-4 items-start animate-in fade-in slide-in-from-top-2">
                        <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${event.type === 'SYNC' ? 'bg-emerald-500' : event.type === 'USER' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                        <div className="flex-grow">
                           <div className="text-[10px] font-black text-slate-900 leading-tight uppercase tracking-tight">{event.msg}</div>
                           <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{event.time}</div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl text-white">
                <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6">Quick Actions</h3>
                <div className="space-y-3">
                   <Link to="/stories/new" className="block w-full text-center py-3 bg-primary-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-primary-500 transition-all">New Transmission</Link>
                   <button className="block w-full py-3 bg-white/5 border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all text-white/60">System Logs</button>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center">
             <div className="w-20 h-20 bg-primary-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-primary-600/30">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l2 2h5a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
             </div>
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">NewsVortex Engine</h3>
             <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
               Access and manage the global narrative stream. View drafts, pending reviews, and live broadcasts.
             </p>
             <Link to="/stories" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all shadow-xl active:scale-95">Enter Archive</Link>
          </div>

          <div className="bg-primary-600 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
             <div className="relative z-10">
               <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-4 opacity-70">Production Node</h4>
               <div className="text-3xl font-black mb-1">99.9%</div>
               <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Uptime Reliability</div>
             </div>
             <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
          </div>
        </div>
      </div>
    </div>
  );
}
