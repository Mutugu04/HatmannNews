import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vortex } from '../services/api';
import { useStation } from '../contexts/StationContext';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface StoryStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  published: number;
}

export default function CentrePage() {
  const { currentStation } = useStation();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const [stats, setStats] = useState<StoryStats>({ total: 0, draft: 0, pending: 0, approved: 0, published: 0 });
  const [pendingStories, setPendingStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const canApprove = user?.role === UserRole.EDITOR || user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (currentStation) {
      loadDashboardData();
    }
  }, [currentStation]);

  useEffect(() => {
    if (!socket) return;
    socket.on('story:created', loadDashboardData);
    socket.on('story:updated', loadDashboardData);
    return () => {
      socket.off('story:created');
      socket.off('story:updated');
    };
  }, [socket]);

  const loadDashboardData = async () => {
    if (!currentStation) return;
    try {
      setLoading(true);
      const [pendingRes, allRes] = await Promise.all([
        vortex.stories.getAll({ stationId: currentStation.id, status: 'PENDING' }),
        vortex.stories.getAll({ stationId: currentStation.id, limit: 1000 })
      ]);
      
      setPendingStories(pendingRes.data.stories || []);
      const allStories = allRes.data.stories || [];
      
      setStats({
        total: allStories.length,
        draft: allStories.filter((s: any) => s.status === 'DRAFT').length,
        pending: allStories.filter((s: any) => s.status === 'PENDING').length,
        approved: allStories.filter((s: any) => s.status === 'APPROVED').length,
        published: allStories.filter((s: any) => s.status === 'PUBLISHED').length,
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (storyId: string, status: 'APPROVED' | 'KILLED') => {
    if (!canApprove) {
      alert('Insufficient permissions to perform this operation.');
      return;
    }
    try {
      await vortex.stories.update(storyId, { status });
      loadDashboardData();
    } catch (error) {
      alert('Action failed.');
    }
  };

  if (loading) return (
    <div className="p-20 text-center">
      <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em]">Compiling Production Metrics...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <div className="mb-12">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-3">Centre Production Hub</h1>
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
            {currentStation?.name} — Node Connection: {isConnected ? 'Synchronized' : 'Offline'}
          </p>
        </div>
      </div>

      {!canApprove && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl mb-10 flex items-center gap-4">
           <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           <p className="text-xs font-black text-amber-800 uppercase tracking-widest">Read-Only Mode: You require Editor or Admin clearance to approve narrative transmissions.</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <StatCard label="Total Narrative" count={stats.total} color="text-slate-900" bg="bg-white" />
        <StatCard label="Editorial Drafts" count={stats.draft} color="text-slate-400" bg="bg-white" />
        <StatCard label="Awaiting Review" count={stats.pending} color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="Approved Archive" count={stats.approved} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Broadcast Final" count={stats.published} color="text-blue-600" bg="bg-blue-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Pending Editorial Approval</h3>
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-full">{pendingStories.length} In Queue</span>
            </div>
            <div className="divide-y divide-slate-50">
              {pendingStories.map(story => (
                <div key={story.id} className="p-10 hover:bg-slate-50/50 transition-all group">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 mb-3 leading-tight tracking-tight">{story.title}</h4>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                        Journalist: {story.author?.first_name} {story.author?.last_name} • Volume: {story.word_count} W
                      </p>
                    </div>
                    {canApprove && (
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button 
                          onClick={() => handleUpdateStatus(story.id, 'KILLED')}
                          className="px-8 py-3.5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 shadow-xl shadow-rose-600/20"
                        >
                          Kill
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(story.id, 'APPROVED')}
                          className="px-8 py-3.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 shadow-xl shadow-emerald-500/20"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {pendingStories.length === 0 && (
                <div className="p-32 text-center text-slate-300 font-black uppercase tracking-[0.5em] text-[11px]">
                  Narrative Queue Empty
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-3xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] mb-10 border-b border-white/5 pb-6">Production Diagnostic</h3>
              <div className="space-y-10">
                <HealthItem label="Editorial Sync" status="Operational" value={100} color="bg-primary-500" />
                <HealthItem label="Socket Handshake" status={isConnected ? "Linked" : "Negotiating"} value={isConnected ? 100 : 25} color={isConnected ? "bg-emerald-500" : "bg-amber-500"} />
                <HealthItem label="Database Latency" status="18ms" value={98} color="bg-indigo-500" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, count, color, bg }: { label: string, count: number, color: string, bg: string }) {
  return (
    <div className={`${bg} p-10 rounded-[3rem] shadow-xl border border-slate-100 text-center transition-all hover:scale-105 duration-300`}>
      <div className={`text-5xl font-black mb-2 tracking-tighter ${color}`}>{count}</div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{label}</div>
    </div>
  );
}

function HealthItem({ label, status, value, color }: { label: string, status: string, value: number, color: string }) {
  return (
    <div className="group">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
        <span className="text-white/60 group-hover:text-white transition-colors">{label}</span>
        <span className="text-primary-400">{status}</span>
      </div>
      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div className={`h-full ${color} rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.1)]`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}