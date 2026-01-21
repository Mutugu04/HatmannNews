import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { vortex } from '../services/SupabaseService';

interface RundownItem {
  id: string;
  position: number;
  type: string;
  title: string;
  plannedDuration: number;
  status: string;
  story?: { id: string; title: string; wordCount: number; };
}

interface Rundown {
  id: string;
  status: string;
  totalDuration: number;
  show_instance: {
    show: { name: string };
    air_date: string;
    start_time: string;
  };
  items: RundownItem[];
}

const ITEM_TYPES = [
  { value: 'STORY', label: '📝 Story', color: 'bg-blue-100 text-blue-700' },
  { value: 'BREAK', label: '⏸️ Break', color: 'bg-slate-100 text-slate-600' },
  { value: 'LIVE', label: '📺 Live', color: 'bg-red-100 text-red-600' },
  { value: 'INTERVIEW', label: '🎙️ Interview', color: 'bg-purple-100 text-purple-600' },
  { value: 'PROMO', label: '📢 Promo', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'MUSIC', label: '🎵 Music', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'AD', label: '💰 Ad', color: 'bg-orange-100 text-orange-700' },
];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function RundownEditor() {
  const { id } = useParams();
  const [rundown, setRundown] = useState<Rundown | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    type: 'STORY',
    title: '',
    plannedDuration: 120,
  });

  useEffect(() => {
    if (id) loadRundown();
  }, [id]);

  const loadRundown = async () => {
    try {
      setLoading(true);
      const response = await vortex.rundowns.getById(id!);
      setRundown(response.data);
    } catch (error) {
      console.error('Failed to load rundown:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!rundown) return;
    try {
      await vortex.rundowns.addItem(rundown.id, newItem);
      setShowAddModal(false);
      setNewItem({ type: 'STORY', title: '', plannedDuration: 120 });
      loadRundown();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this segment?')) return;
    try {
      await vortex.rundowns.deleteItem(itemId);
      loadRundown();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">Querying Production Node...</div>;
  if (!rundown) return <div className="p-20 text-center text-rose-500 font-black uppercase tracking-widest text-xs">Sequence Not Found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12 mb-8 relative overflow-hidden">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">
              {rundown.show_instance.show.name}
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              {new Date(rundown.show_instance.air_date).toLocaleDateString()} • {formatDuration(rundown.totalDuration)} Total
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-600/20"
          >
            + Add Segment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {rundown.items.map((item, index) => (
            <div key={item.id} className="p-8 flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black text-slate-200 mono">{index + 1}</span>
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest">{item.type}</span>
                <h3 className="text-lg font-black text-slate-900">{item.title}</h3>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-sm font-black mono text-slate-400">{formatDuration(item.plannedDuration)}</span>
                <button onClick={() => handleDeleteItem(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Add Segment</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Title</label>
                <input type="text" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} className="w-full bg-slate-50 rounded-xl px-5 py-4 text-sm font-black" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Duration (sec)</label>
                <input type="number" value={newItem.plannedDuration} onChange={e => setNewItem({...newItem, plannedDuration: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 rounded-xl px-5 py-4 text-sm font-black" />
              </div>
              <div className="flex gap-3 pt-6">
                <button onClick={() => setShowAddModal(false)} className="flex-grow py-4 text-[10px] font-black uppercase">Cancel</button>
                <button onClick={handleAddItem} className="flex-grow py-4 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase">Insert</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}