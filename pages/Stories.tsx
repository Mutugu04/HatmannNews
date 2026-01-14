import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useStation } from '../contexts/StationContext';

interface Story {
  id: string;
  title: string;
  status: string;
  wordCount: number;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
}

interface StoriesResponse {
  success: boolean;
  data: {
    stories: Story[];
    total: number;
    page: number;
    totalPages: number;
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
      const response = await api.get<StoriesResponse>(`/stories?stationId=${currentStation?.id}`);
      setStories(response.data.data.stories || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load stories');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      PUBLISHED: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!currentStation) return <div className="p-8 text-center text-slate-400">Please select a station.</div>;
  if (loading) return <div className="p-8 text-center animate-pulse font-black uppercase tracking-widest text-slate-400">Loading Intelligence...</div>;
  if (error) return <div className="p-8 text-center text-red-600 font-bold">{error}</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Stories</h1>
          <p className="text-slate-500 text-sm font-medium">Manage and monitor editorial content workflow</p>
        </div>
        <Link 
          to="/stories/new" 
          className="bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-600/20"
        >
          New Story
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Title</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Words</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Author</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {stories.map((story) => (
                <tr key={story.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/stories/${story.id}`} className="text-primary-600 font-bold hover:underline">
                      {story.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(story.status)}`}>
                      {story.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                    {story.wordCount}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-bold">
                    {story.author?.firstName} {story.author?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {stories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l2 2h5a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
                      <span className="text-xs font-black uppercase tracking-widest">No intelligence gathered yet</span>
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
