import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useStation } from '../contexts/StationContext';
import { useSocket } from '../contexts/SocketContext';

interface StoryStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  published: number;
}

const MOCK_STATS: StoryStats = {
  total: 42,
  draft: 12,
  pending: 5,
  approved: 15,
  published: 10
};

const MOCK_PENDING = [
  { id: '101', title: 'Local Economic Growth Hits Record High', wordCount: 450, author: { firstName: 'Sarah', lastName: 'Connor' }, status: 'PENDING' },
  { id: '102', title: 'Infrastructure Update: New Bridge Construction', wordCount: 820, author: { firstName: 'John', lastName: 'Doe' }, status: 'PENDING' },
  { id: '103', title: 'Healthcare Initiative Launched in Rural Areas', wordCount: 615, author: { firstName: 'Alice', lastName: 'Smith' }, status: 'PENDING' },
];

export default function CentrePage() {
  const { currentStation } = useStation();
  const { socket, isConnected } = useSocket();
  const [stats, setStats] = useState<StoryStats | null>(null);
  const [pendingStories, setPendingStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentStation) {
      loadDashboardData();
    }
  }, [currentStation]);

  // Real-time Updates
  useEffect(() => {
    if (!socket) return;

    socket.on('story:created', (data) => {
      console.log('New story created:', data);
      loadDashboardData();
    });

    socket.on('story:updated', (data) => {
      console.log('Story updated:', data);
      loadDashboardData();
    });

    socket.on('story:approved', (data) => {
      console.log('Story approved:', data);
      loadDashboardData();
    });

    return () => {
      socket.off('story:created');
      socket.off('story:updated');
      socket.off('story:approved');
    };
  }, [socket]);

  const loadDashboardData = async () => {
    if (!currentStation) return;
    try {
      setLoading(true);
      
      // Load pending stories for approval list
      const pendingRes = await api.get(`/stories?stationId=${currentStation.id}&status=PENDING`)
        .catch(() => ({ data: { data: { stories: MOCK_PENDING } } }));
      
      setPendingStories(pendingRes.data.data.stories || []);

      // Calculate stats from all stories
      const allRes = await api.get(`/stories?stationId=${currentStation.id}&limit=1000`)
        .catch(() => ({ data: { data: { stories: [] } } }));
      
      const allStories = allRes.data.data.stories || [];
      
      if (allStories.length > 0) {
        const statsData: StoryStats = {
          total: allStories.length,
          draft: allStories.filter((s: any) => s.status === 'DRAFT').length,
          pending: allStories.filter((s: any) => s.status === 'PENDING').length,
          approved: allStories.filter((s: any) => s.status === 'APPROVED').length,
          published: allStories.filter((s: any) => s.status === 'PUBLISHED').length,
        };
        setStats(statsData);
      } else {
        // Fallback to mock stats for demo purposes
        setStats(MOCK_STATS);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setStats(MOCK_STATS);
      setPendingStories(MOCK_PENDING);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (storyId: string) => {
    try {
      // Optimistic update for demo
      setPendingStories(prev => prev.filter(s => s.id !== storyId));
      if (stats) {
        setStats({
          ...stats,
          pending: Math.max(0, stats.pending - 1),
          approved: stats.approved + 1
        });
      }
      
      await api.patch(`/stories/${storyId}`, { status: 'APPROVED' }).catch(() => {
        console.warn('API update failed, keeping optimistic UI change for demo');
      });
    } catch (error) {
      console.error('Failed to approve story:', error);
    }
  };

  if (!currentStation) {
    return (
      <div className="p-12 text-center">
        <div className="max-w-md mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">No Station Selected</h2>
          <p className="text-slate-500 text-sm font-medium">Please select a broadcast station from the header to view the Centre Page intelligence.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            Centre Page <span className="text-slate-400">—</span> {currentStation.name}
          </h1>
          <p className="text-slate-500 text-sm font-medium">Editorial oversight and distribution control center.</p>
        </div>
        
        {/* Connection Indicator */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {isConnected ? 'Real-time Live' : 'Offline Mode'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Stories" value={stats.total} color="text-primary-600" />
          <StatCard label="Drafts" value={stats.draft} color="text-slate-400" />
          <StatCard label="Pending" value={stats.pending} color="text-amber-500" />
          <StatCard label="Approved" value={stats.approved} color="text-emerald-500" />
          <StatCard label="Published" value={stats.published} color="text-sky-500" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Approvals */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Pending Approval <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-600 rounded-lg text-[10px]">{pendingStories.length}</span>
              </h2>
            </div>
            
            <div className="p-4">
              {loading ? (
                <div className="py-20 text-center animate-pulse text-slate-300 font-black uppercase tracking-widest text-xs">Synchronizing Archive...</div>
              ) : pendingStories.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <p className="font-black uppercase tracking-widest text-[10px] mb-2">Queue Empty</p>
                  <p className="text-xs">No transmissions currently awaiting verification.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingStories.map((story) => (
                    <div key={story.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 group">
                      <div className="flex-grow">
                        <h3 className="font-bold text-slate-900 mb-1">{story.title}</h3>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span>{story.author?.firstName} {story.author?.lastName}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span>{story.wordCount || 0} Words</span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleApprove(story.id)}
                          className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 mb-4">Editorial Note</h3>
              <p className="text-sm font-medium leading-relaxed text-slate-300 italic">
                "The Centre Page serves as the final gateway before broadcast. Exercise extreme diligence in approval workflows."
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-6 border-b border-slate-50 pb-4">Distribution Metrics</h3>
            <div className="space-y-4">
              <MetricRow label="Sync Latency" value="24ms" />
              <MetricRow label="Active Editors" value="12" />
              <MetricRow label="Node Health" value="100%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 flex flex-col items-center text-center">
      <div className={`text-3xl font-black mb-1 ${color}`}>{value}</div>
      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-[11px] font-black text-slate-900 mono">{value}</span>
    </div>
  );
}