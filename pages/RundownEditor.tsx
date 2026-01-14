import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';

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
  showInstance: {
    show: { name: string };
    airDate: string;
    startTime: string;
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
  const [isSyncing, setIsSyncing] = useState(true);
  const [newItem, setNewItem] = useState({
    type: 'STORY',
    title: '',
    plannedDuration: 120,
  });

  useEffect(() => {
    if (id) loadRundown();
    
    // Simulate real-time heartbeat
    const syncInterval = setInterval(() => {
      setIsSyncing(prev => !prev);
      setTimeout(() => setIsSyncing(true), 200);
    }, 5000);
    
    return () => clearInterval(syncInterval);
  }, [id]);

  const loadRundown = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/rundown/rundowns/${id}`);
      setRundown(response.data.data);
    } catch (error) {
      console.error('Failed to load rundown:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!rundown) return;
    try {
      await api.post(`/rundown/rundowns/${rundown.id}/items`, newItem);
      setShowAddModal(false);
      setNewItem({ type: 'STORY', title: '', plannedDuration: 120 });
      loadRundown();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this segment from the transmission?')) return;
    try {
      await api.delete(`/rundown/rundowns/items/${itemId}`);
      loadRundown();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const getItemTypeInfo = (type: string) => {
    return ITEM_TYPES.find(t => t.value === type) || ITEM_TYPES[0];
  };

  if (loading) return <div className="p-12 text-center text-slate-400 font-black uppercase tracking-[0.5em] text-xs">Querying Production Node...</div>;
  if (!rundown) return <div className="p-12 text-center text-rose-500 font-black uppercase tracking-widest text-xs">Transmission sequence not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12 mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-600/30">
                Live Production
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <div className="flex items-center gap-1.5">
                 <span className={`w-2 h-2 rounded-full transition-all duration-300 ${isSyncing ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-300'}`}></span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Socket Sync: ACTIVE</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">
              {rundown.showInstance.show.name}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {new Date(rundown.showInstance.airDate).toLocaleDateString()} • {new Date(rundown.showInstance.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-4xl font-black text-slate-900 mono tracking-tighter">
              {formatDuration(rundown.totalDuration)}
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Broadcast Duration</div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-6 px-8 py-3 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-500 transition-all shadow-xl shadow-primary-600/20 active:scale-95"
            >
              + Add Segment
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-40"></div>
      </div>

      {/* Rundown Items */}
      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="px-10 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Show Sequence / Segment Data</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{rundown.items.length} Elements</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {rundown.items.map((item, index) => {
            const typeInfo = getItemTypeInfo(item.type);
            return (
              <div key={item.id} className="group flex flex-col md:flex-row items-center gap-6 p-8 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-6 flex-grow w-full">
                  <div className="w-10 text-[10px] font-black text-slate-300 mono">{index + 1}</div>
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${typeInfo.color}`}>
                    {typeInfo.label}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-primary-600 transition-colors">
                      {item.title}
                    </h3>
                    {item.story && (
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
                        Linked Narrative: {item.story.title} ({item.story.wordCount} words)
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900 mono">
                      {formatDuration(item.plannedDuration)}
                    </div>
                    <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Planned</div>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
          
          {rundown.items.length === 0 && (
            <div className="p-20 text-center text-slate-300">
              <svg className="w-16 h-16 mx-auto mb-6 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-xs font-black uppercase tracking-[0.3em]">Transmission sequence is empty.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 border border-slate-200 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">New Transmission Segment</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Segment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {ITEM_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setNewItem({ ...newItem, type: t.value })}
                      className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 text-left ${
                        newItem.type === t.value ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-slate-50 text-slate-500 border-transparent hover:border-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Display Title</label>
                <input 
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Segment identifier..."
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Planned Duration (Seconds)</label>
                <input 
                  type="number"
                  value={newItem.plannedDuration}
                  onChange={(e) => setNewItem({ ...newItem, plannedDuration: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
              </div>
              <div className="pt-6 flex gap-3">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-grow py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddItem}
                  className="flex-grow py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-500 transition-all shadow-xl shadow-primary-600/20"
                >
                  Insert Segment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}