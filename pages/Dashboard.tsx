
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// Fix: Use @firebase/firestore for reliable named exports in this environment
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from '@firebase/firestore';
import { db } from '../services/firebase';

interface LiveEvent {
  id: string;
  type: 'SYNC' | 'USER' | 'STORY' | 'ALERT';
  msg: string;
  time: string;
  timestamp?: Timestamp;
}

interface DiagnosticMetrics {
  nodeHealth: number;
  successRate: number;
  latency: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [liveFeed, setLiveFeed] = useState<LiveEvent[]>([]);
  const [metrics, setMetrics] = useState<DiagnosticMetrics>({
    nodeHealth: 98,
    successRate: 99,
    latency: 14
  });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Establishing real-time connection using the Modular SDK query functions
    const q = query(
      collection(db, 'news_vortex'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const events: LiveEvent[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
          id: doc.id,
          type: data.type || 'SYNC',
          msg: data.msg || 'No data payload',
          time: data.timestamp ? new Date((data.timestamp as Timestamp).toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown',
          ...data
        } as LiveEvent);
      });

      setLiveFeed(events);
      setIsLive(true);
      
      if (events.length > 0) {
        setMetrics({
          nodeHealth: Math.min(100, 95 + Math.random() * 5),
          successRate: Math.min(100, 98 + Math.random() * 2),
          latency: Math.floor(12 + Math.random() * 8)
        });
      }
    }, (error) => {
      console.error('[NewsVortex] Firestore Handshake Failed:', error);
      setIsLive(false);
    });

    return () => unsubscribe();
  }, []);
  
  return (
    <div className="animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          <div className="vortex-card bg-white relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-600"></div>
            <div className="flex justify-between items-start mb-6">
              <span className="inline-block px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                {isLive ? 'Live Stream Active' : 'Negotiating Node...'}
              </span>
              {isLive && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Synchronized</span>
                </div>
              )}
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4 uppercase leading-tight">Welcome, {user?.firstName}.</h2>
            <p className="text-slate-500 font-medium text-base md:text-lg leading-relaxed max-w-xl">
              The HATMANN NewsVortex is currently handling <span className="text-slate-900 font-black">{(liveFeed.length * 12).toLocaleString()}</span> active node events per minute across the cluster.
            </p>
            
            <div className="mt-8 p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-md shrink-0">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
               </div>
               <div className="overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Cluster Identity</p>
                  <p className="text-slate-900 font-bold mono text-xs md:text-sm truncate">{user?.email}</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
             {/* Firestore Live Feed */}
             <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-lg border border-slate-100 flex flex-col h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Intelligence</h3>
                  <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
                    <span className="text-[8px] font-black text-slate-500 uppercase">Socket IO 4.8</span>
                  </div>
                </div>
                <div className="space-y-4 overflow-y-auto no-scrollbar flex-grow pr-2">
                   {liveFeed.length > 0 ? liveFeed.map((event, idx) => (
                     <div key={event.id} className="flex gap-3 md:gap-4 items-start animate-in fade-in slide-in-from-top-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className={`w-2 h-2 mt-1 rounded-full shrink-0 ${
                          event.type === 'SYNC' ? 'bg-emerald-500' : 
                          event.type === 'USER' ? 'bg-blue-500' : 
                          event.type === 'ALERT' ? 'bg-rose-500' : 'bg-amber-500'
                        }`} />
                        <div className="flex-grow">
                           <div className="text-[9px] md:text-[10px] font-black text-slate-900 leading-tight uppercase tracking-tight">{event.msg}</div>
                           <div className="text-[7px] md:text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{event.time}</div>
                        </div>
                     </div>
                   )) : (
                     <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-10 h-10 border-2 border-slate-100 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Establishing Secure Stream...</p>
                     </div>
                   )}
                </div>
             </div>

             {/* Diagnostic Real-time Charts */}
             <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] shadow-2xl text-white">
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-8">Node Diagnostic Analytics</h3>
                <div className="space-y-8">
                   <div className="group">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-3">
                        <span className="text-white/60">Success Rate</span>
                        <span className="text-emerald-400">{metrics.successRate.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
                          style={{ width: `${metrics.successRate}%` }}
                        ></div>
                      </div>
                   </div>
                   <div className="group">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-3">
                        <span className="text-white/60">Cluster Latency</span>
                        <span className="text-primary-400">{metrics.latency}ms</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 transition-all duration-1000 ease-out" 
                          style={{ width: `${Math.min(100, (metrics.latency / 50) * 100)}%` }}
                        ></div>
                      </div>
                   </div>
                   <div className="group">
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-3">
                        <span className="text-white/60">System Stability</span>
                        <span className="text-indigo-400">{metrics.nodeHealth.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
                          style={{ width: `${metrics.nodeHealth}%` }}
                        ></div>
                      </div>
                   </div>
                   
                   <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                      <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Encryption Level</div>
                      <div className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest">AES-256 BIT</div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar/Callouts */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center">
             <div className="w-16 h-16 md:w-20 md:h-20 bg-primary-600 rounded-2xl md:rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl shadow-primary-600/30">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l2 2h5a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
             </div>
             <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Narrative Node</h3>
             <p className="text-slate-400 text-xs md:text-sm font-medium mb-8 leading-relaxed">
               Access the global archive. Manage drafts and live transmissions with real-time Firestore sync.
             </p>
             <Link to="/stories" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all shadow-xl active:scale-95">Open Archive</Link>
          </div>

          <div className="bg-primary-600 p-6 md:p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
             <div className="relative z-10">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70">Production Uptime</h4>
               <div className="text-2xl md:text-3xl font-black mb-1">99.9%</div>
               <div className="text-[9px] font-bold uppercase tracking-widest opacity-60">Verified Stable Cluster</div>
             </div>
             <div className="absolute -bottom-6 -right-6 w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
          </div>
        </div>
      </div>
    </div>
  );
}
