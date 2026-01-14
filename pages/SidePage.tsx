import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useStation } from '../contexts/StationContext';
import { useAuth } from '../contexts/AuthContext';

interface Story {
  id: string;
  title: string;
  status: string;
  wordCount: number;
  updatedAt: string;
  category?: { name: string };
}

export default function SidePage() {
  const { currentStation } = useStation();
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
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
      let url = `/stories?stationId=${currentStation.id}&authorId=${user.id}`;
      if (filter !== 'all') {
        url += `&status=${filter}`;
      }
      const response = await api.get(url);
      setStories(response.data.data.stories || []);
    } catch (error) {
      console.error('Failed to load stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'border-l-slate-400',
      PENDING: 'border-l-amber-400',
      APPROVED: 'border-l-emerald-400',
      PUBLISHED: 'border-l-sky-400',
      KILLED: 'border-l-rose-400',
    };
    return colors[status] || 'border-l-slate-400';
  };

  const groupedStories = {
    DRAFT: stories.filter(s => s.status === 'DRAFT'),
    PENDING: stories.filter(s => s.status === 'PENDING'),
    APPROVED: stories.filter(s => s.status === 'APPROVED'),
    PUBLISHED: stories.filter(s => s.status === 'PUBLISHED'),
  };

  if (!currentStation) return (
    <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest text-xs">
      Select a station to initialize workspace...
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">My Workspace</h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentStation.name}</p>
          </div>
        </div>
        <Link 
          to="/stories/new" 
          className="px-8 py-3 bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 active:scale-95"
        >
          + New Transmission
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatWidget label="Drafts" count={groupedStories.DRAFT.length} color="text-slate-500" />
        <StatWidget label="Pending" count={groupedStories.PENDING.length} color="text-amber-500" />
        <StatWidget label="Approved" count={groupedStories.APPROVED.length} color="text-emerald-500" />
        <StatWidget label="Published" count={groupedStories.PUBLISHED.length} color="text-sky-500" />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 inline-flex">
        {['all', 'DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === f 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'All Intelligence' : f}
          </button>
        ))}
      </div>

      {/* Story List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Querying local node...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] border border-dashed border-slate-200 text-center">
            <svg className="w-12 h-12 text-slate-100 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l2 2h5a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No transmissions matched your criteria.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {stories.map(story => (
              <Link
                key={story.id}
                to={`/stories/${story.id}`}
                className={`group block bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-100 border-l-[6px] ${getStatusColor(story.status)} transition-all active:scale-[0.99]`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-primary-600 transition-colors leading-tight">{story.title}</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full">
                        {story.category?.name || 'Uncategorized'}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {new Date(story.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[14px] font-black text-slate-900 mono">{story.wordCount}</span>
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Words</span>
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
    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center justify-center transition-all hover:-translate-y-1">
      <div className={`text-4xl font-black mb-1 ${color}`}>{count}</div>
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</div>
    </div>
  );
}
