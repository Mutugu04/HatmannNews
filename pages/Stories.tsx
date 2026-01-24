
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vortex } from '../services/api';
import { useStation } from '../contexts/StationContext';

interface Story {
  id: string;
  title: string;
  status: string;
  word_count: number;
  created_at: string;
  author: {
    first_name: string;
    last_name: string;
  };
}

export default function Stories() {
  const { currentStation } = useStation();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (currentStation) {
      loadStories();
    }
  }, [currentStation]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const response = await vortex.stories.getAll({ stationId: currentStation?.id });
      setStories(response.data.stories as any || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClasses = (status: string) => {
    const baseClasses = "inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border-2 shadow-sm transition-all";
    const colors: Record<string, string> = {
      DRAFT: 'bg-slate-200 text-slate-800 border-slate-300',
      PENDING: 'bg-amber-400 text-amber-950 border-amber-500',
      APPROVED: 'bg-emerald-500 text-emerald-50 border-emerald-600',
      PUBLISHED: 'bg-blue-600 text-blue-50 border-blue-700',
      KILLED: 'bg-rose-600 text-rose-50 border-rose-700',
    };
    return `${baseClasses} ${colors[status] || 'bg-slate-200 text-slate-800 border-slate-300'}`;
  };

  if (!currentStation) return <div className="p-12 text-center text-slate-400 font-black uppercase tracking-[0.5em] text-xs">Initialize local station node...</div>;
  if (loading) return <div className="p-12 text-center animate-pulse font-black uppercase tracking-[0.5em] text-slate-400 text-xs">Synchronizing Archive...</div>;
  if (error) return <div className="p-8 text-center text-rose-600 font-black uppercase tracking-widest text-xs border-2 border-dashed border-rose-100 rounded-3xl mx-auto max-w-md mt-10">{error}</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Editorial Archives</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">System Aggregate Intelligence for {currentStation.name}</p>
        </div>
        <Link 
          to="/stories/new" 
          className="bg-primary-600 text-white px-10 py-4 rounded-[1.5rem] hover:bg-primary-500 transition-all font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary-600/30 active:scale-95"
        >
          + New Transmission
        </Link>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Narrative Identity</th>
                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Node Status</th>
                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Volume</th>
                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Source Identity</th>
                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Sync Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {stories.map((story) => (
                <tr key={story.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-10 py-8">
                    <Link to={`/stories/${story.id}`} className="text-slate-900 font-black text-xl hover:text-primary-600 transition-colors block leading-tight tracking-tight">
                      {story.title}
                    </Link>
                  </td>
                  <td className="px-10 py-8">
                    <span className={getStatusClasses(story.status)}>
                      {story.status}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-base font-black text-slate-400 mono tracking-tighter">{story.word_count || 0} <span className="text-[10px] font-bold">W</span></span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-[1rem] bg-slate-900 flex items-center justify-center text-[11px] font-black text-white shadow-lg">
                          {story.author?.first_name[0]}{story.author?.last_name[0]}
                       </div>
                       <span className="text-[12px] font-black text-slate-700 uppercase tracking-tight">
                        {story.author?.first_name} {story.author?.last_name}
                       </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
                      {new Date(story.created_at).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
              {stories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-40 text-center text-slate-300">
                    <div className="flex flex-col items-center gap-8">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center">
                        <svg className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l2 2h5a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
                      </div>
                      <span className="text-[12px] font-black uppercase tracking-[0.6em]">No narratives in local archive</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
