import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vortex } from '../services/api';
import { useStation } from '../contexts/StationContext';
import { useSocket } from '../contexts/SocketContext';

interface StoryStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  published: number;
}

export default function CentrePage() {
  const { currentStation } = useStation();
  const { socket, isConnected } = useSocket();
  const [stats, setStats] = useState<StoryStats>({ total: 0, draft: 0, pending: 0, approved: 0, published: 0 });
  const [pendingStories, setPendingStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      await vortex.stories.update(storyId, { status });
      loadDashboardData();
    } catch (error) {
      alert('Action failed.');
    }
  };

  if (loading) return (
    <div className="p-20 text-center">
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Production Metrics...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-3">Centre Production Hub</h1>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {currentStation?.name} — Node Connection: {isConnected ? 'Synchronized' : 'Offline'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <StatCard label="Total Narrative" count={stats.total} color="text-slate-900" />
        <StatCard label="Editorial Drafts" count={stats.draft} color="text-slate-400" />
        <StatCard label="Awaiting Review" count={stats.pending} color="text-amber-500" />
        <StatCard label="Approved Archive" count={stats.approved} color="text-emerald-500" />
        <StatCard label="Broadcast Final" count={stats.published} color="text-primary-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending Editorial Approval</h3>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{pendingStories.length} In Queue</span>
            </div>
            <div className="divide-y divide-slate-50">
              {pendingStories.map(story => (
                <div key={story.id} className="p-8 hover:bg-slate-50/50 transition-all group">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <h4 className="text-xl font-black text-slate-900 mb-2 leading-tight">{story.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        By {story.author?.first_name} {story.author?.last_name} • {story.word_count} Words
                      </p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleUpdateStatus(story.id, 'KILLED')}
                        className="px-6 py-2.5 bg-rose-100 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-200"
                      >
                        Kill
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(story.id, 'APPROVED')}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingStories.length === 0 && (
                <div className="p-20 text-center text-slate-300 font-black uppercase tracking-[0.3em] text-[10px]">
                  Queue Cleared • No Pending Narratives
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-8">Production Health</h3>
              <div className="space-y-6">
                <HealthItem label="Editorial Sync" status="Normal" value={100} />
                <HealthItem label="Socket Handshake" status={isConnected ? "Active" : "Retrying"} value={isConnected ? 100 : 20} />
                <HealthItem label="Database Latency" status="14ms" value={95} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, count, color }: { label: string, count: number, color: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 text-center">
      <div className={`text-3xl font-black mb-1 ${color}`}>{count}</div>
      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  );
}

function HealthItem({ label, status, value }: { label: string, status: string, value: number }) {
  return (
    <div>
      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-2">
        <span>{label}</span>
        <span className="text-primary-400">{status}</span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}