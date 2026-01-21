
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vortex, Story } from '../services/SupabaseService';
import { useStation } from '../contexts/StationContext';
import { useAuth } from '../contexts/AuthContext';

interface StoryDisplay {
  id: string;
  title: string;
  status: string;
  word_count: number;
  updated_at: string;
  category?: { name: string };
}

export default function SidePage() {
  const { currentStation } = useStation();
  const { user } = useAuth();
  const [stories, setStories] = useState<StoryDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (currentStation && user) {
      loadMyStories();
    }
  }, [currentStation, user, filter]);

  const loadMyStories = async () => {
    if (!currentStation || !user) return;
    try {
      setLoading(true);
      const response = await vortex.stories.getAll({
        stationId: currentStation.id,
        authorId: user.id,
        status: filter !== 'all' ? filter as any : undefined
      });
      setStories(response.data.stories || []);
    } catch (error) {
      console.error('Failed to load stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'border-l-slate-400',
      PENDING: 'border-l-amber-500 bg-amber-50/30',
      APPROVED: 'border-l-emerald-500 bg-emerald-50/30',
      PUBLISHED: 'border-l-blue-600 bg-blue-50/30',
      KILLED: 'border-l-rose-500 bg-rose-50/30',
    };
    return colors[status] || 'border-l-slate-400';
  };

  const getBadgeStyle = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-slate-200 text-slate-700',
      PENDING: 'bg-amber-400 text-amber-950 shadow-amber-500/20',
      APPROVED: 'bg-emerald-500 text-white shadow-emerald-500/20',
      PUBLISHED: 'bg-blue-600 text-white shadow-blue-600/20',
      KILLED: 'bg-rose-600 text-white shadow-rose-600/20',
    };
    return styles[status] || 'bg-slate-200 text-slate-700';
  };

  const groupedStories = {
    DRAFT: stories.filter(s => s.status === 'DRAFT'),
    PENDING: stories.filter(s => s.status === 'PENDING'),
    APPROVED: stories.filter(s => s.status === 'APPROVED'),
    PUBLISHED: stories.filter(s => s.status === 'PUBLISHED'),
  };

  if (!currentStation) return (
    <div className="p-20 text-center text-slate-600 font-black uppercase tracking-[0.3em] text-sm" role="status">
      Initialize Workspace Node...
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-4">My Workspace</h1>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" aria-hidden="true"></span>
            <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]"><span className="sr-only">Status: </span>{currentStation.name} Cluster ACTIVE</p>
          </div>
        </div>
        <Link
          to="/stories/new"
          className="px-12 py-5 bg-primary-600 text-white font-black uppercase tracking-widest text-sm rounded-[2rem] hover:bg-primary-500 transition-all shadow-3xl shadow-primary-600/30 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
        >
          + New Transmission
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatWidget label="Editorial Drafts" count={groupedStories.DRAFT.length} color="text-slate-500" />
        <StatWidget label="Review Queue" count={groupedStories.PENDING.length} color="text-amber-600" />
        <StatWidget label="Verified Core" count={groupedStories.APPROVED.length} color="text-emerald-600" />
        <StatWidget label="Live Archives" count={groupedStories.PUBLISHED.length} color="text-blue-700" />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-10 bg-white p-3 rounded-[2.5rem] shadow-xl border border-slate-50 inline-flex" role="tablist" aria-label="Filter stories">
        {['all', 'DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            role="tab"
            aria-selected={filter === f}
            className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${filter === f
                ? 'bg-slate-900 text-white shadow-2xl'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
          >
            {f === 'all' ? 'All Intelligence' : f}
          </button>
        ))}
      </div>

      {/* Story List */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-40 text-center" role="status" aria-live="polite">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-8 shadow-2xl shadow-primary-600/20" aria-hidden="true"></div>
            <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Synchronizing Local Cluster...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="bg-white p-40 rounded-[5rem] border-4 border-dashed border-slate-100 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10" aria-hidden="true">
              <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l2 2h5a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
            </div>
            <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Workspace Archive is Empty.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {stories.map(story => (
              <Link
                key={story.id}
                to={`/stories/${story.id}`}
                className={`group block bg-white p-10 rounded-[3.5rem] shadow-sm hover:shadow-3xl border border-slate-50 border-l-[12px] ${getStatusColor(story.status)} transition-all active:scale-[0.99]`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg ${getBadgeStyle(story.status)}`}>
                        {story.status}
                      </span>
                      <span className="text-xs font-black text-primary-700 uppercase tracking-widest bg-primary-50 px-5 py-1.5 rounded-full border border-primary-100">
                        {story.category?.name || 'UNCATEGORIZED'}
                      </span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-primary-600 transition-colors leading-tight tracking-tighter">{story.title}</h3>
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-3 text-xs font-black text-slate-500 uppercase tracking-widest">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Last Sync: {new Date(story.updated_at).toLocaleDateString()}
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300" aria-hidden="true"></div>
                      <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
                        ID: {story.id.substring(0, 8)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-4xl font-black text-slate-900 mono tracking-tighter">{story.word_count}</span>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">WORD COUNT</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatWidget({ label, count, color }: { label: string, count: number, color: string }) {
  return (
    <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-slate-50 flex flex-col items-center justify-center transition-all hover:translate-y-[-8px] group">
      <div className={`text-6xl font-black mb-3 tracking-tighter transition-all group-hover:scale-110 ${color}`}>{count}</div>
      <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 text-center">{label}</div>
    </div>
  );
}
