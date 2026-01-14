import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useStation } from '../contexts/StationContext';
import Layout from '../components/Layout';

interface Show {
  id: string;
  name: string;
  description: string;
  defaultDuration: number;
}

interface ShowInstance {
  id: string;
  airDate: string;
  startTime: string;
  status: string;
  rundown: { id: string; status: string } | null;
}

export default function Shows() {
  const { currentStation } = useStation();
  const navigate = useNavigate();
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [instances, setInstances] = useState<ShowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newShow, setNewShow] = useState({
    name: '',
    description: '',
    defaultDuration: 60,
  });
  const [newInstance, setNewInstance] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
  });

  useEffect(() => {
    if (currentStation) loadShows();
  }, [currentStation]);

  useEffect(() => {
    if (selectedShow) loadInstances(selectedShow.id);
  }, [selectedShow]);

  const loadShows = async () => {
    if (!currentStation) return;
    try {
      setLoading(true);
      const response = await api.get(`/rundown/shows?stationId=${currentStation.id}`);
      const showList = response.data.data || [];
      setShows(showList);
      if (showList.length > 0 && !selectedShow) {
        setSelectedShow(showList[0]);
      }
    } catch (error) {
      console.error('Failed to load shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInstances = async (showId: string) => {
    try {
      const response = await api.get(`/rundown/shows/${showId}/instances`);
      setInstances(response.data.data || []);
    } catch (error) {
      console.error('Failed to load instances:', error);
    }
  };

  const handleCreateShow = async () => {
    if (!currentStation) return;
    try {
      await api.post('/rundown/shows', {
        ...newShow,
        stationId: currentStation.id,
      });
      setShowCreateModal(false);
      setNewShow({ name: '', description: '', defaultDuration: 60 });
      loadShows();
    } catch (error) {
      console.error('Failed to create show:', error);
    }
  };

  const handleCreateInstance = async () => {
    if (!selectedShow || !newInstance.date) return;
    try {
      const airDate = new Date(newInstance.date);
      const startTime = new Date(`${newInstance.date}T${newInstance.startTime}`);
      const endTime = new Date(`${newInstance.date}T${newInstance.endTime}`);
      
      const response = await api.post(`/rundown/shows/${selectedShow.id}/instances`, {
        airDate: airDate.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
      
      const rundownId = response.data.data.rundown?.id;
      if (rundownId) {
        navigate(`/rundown/${rundownId}`);
      } else {
        loadInstances(selectedShow.id);
      }
    } catch (error) {
      console.error('Failed to create instance:', error);
    }
  };

  if (!currentStation) {
    return (
      <div className="flex items-center justify-center p-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Initialize local station node to access production...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-3">Shows & Rundowns</h1>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Orchestration Feed — {currentStation.callSign}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 text-white px-10 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-primary-500 transition-all shadow-2xl shadow-primary-600/20 active:scale-95"
        >
          + Define New Show
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 ml-4">Show Catalog</h3>
          <div className="space-y-3">
            {shows.map((show) => (
              <button
                key={show.id}
                onClick={() => setSelectedShow(show)}
                className={`w-full text-left p-6 rounded-[2rem] transition-all border-2 flex flex-col gap-1 ${
                  selectedShow?.id === show.id 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xl' 
                    : 'bg-white text-slate-600 border-slate-50 hover:border-slate-200'
                }`}
              >
                <span className="font-black uppercase text-sm tracking-tight">{show.name}</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${selectedShow?.id === show.id ? 'text-slate-400' : 'text-slate-300'}`}>
                  {show.defaultDuration} Min Slot
                </span>
              </button>
            ))}
          </div>
          {shows.length === 0 && !loading && (
            <div className="p-10 text-center bg-white rounded-[2.5rem] border border-slate-100 text-slate-300">
               <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">No production slots defined for this station.</p>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          {selectedShow ? (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              {/* Schedule Form */}
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-8">Schedule Transmission Instance</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="md:col-span-1">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Air Date</label>
                      <input 
                        type="date"
                        value={newInstance.date}
                        onChange={(e) => setNewInstance({...newInstance, date: e.target.value})}
                        className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-[11px] font-black text-slate-700 focus:ring-4 focus:ring-primary-500/10 transition-all"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">On-Air Time</label>
                      <input 
                        type="time"
                        value={newInstance.startTime}
                        onChange={(e) => setNewInstance({...newInstance, startTime: e.target.value})}
                        className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-[11px] font-black text-slate-700 focus:ring-4 focus:ring-primary-500/10 transition-all"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Off-Air Time</label>
                      <input 
                        type="time"
                        value={newInstance.endTime}
                        onChange={(e) => setNewInstance({...newInstance, endTime: e.target.value})}
                        className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-[11px] font-black text-slate-700 focus:ring-4 focus:ring-primary-500/10 transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleCreateInstance}
                      className="w-full h-[52px] bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                    >
                      Generate Rundown
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-30"></div>
              </div>

              {/* Instances List */}
              <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="px-12 py-8 border-b border-slate-50 bg-slate-50/30">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Upcoming Transmission Sequences</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {instances.map((instance) => (
                    <div key={instance.id} className="group p-10 flex flex-col sm:flex-row items-center justify-between gap-8 hover:bg-slate-50/80 transition-all">
                      <div className="flex items-center gap-10">
                        <div className="text-center w-16">
                           <div className="text-3xl font-black text-slate-900 leading-none mb-1">
                             {new Date(instance.airDate).toLocaleDateString([], { day: '2-digit' })}
                           </div>
                           <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                             {new Date(instance.airDate).toLocaleDateString([], { month: 'short' })}
                           </div>
                        </div>
                        <div className="w-px h-12 bg-slate-100 hidden sm:block" />
                        <div>
                           <div className="text-lg font-black text-slate-800 mb-2">
                             {new Date(instance.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </div>
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${
                             instance.status === 'LIVE' ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-slate-100 text-slate-400'
                           }`}>
                             {instance.status}
                           </span>
                        </div>
                      </div>
                      
                      {instance.rundown && (
                        <button 
                          onClick={() => navigate(`/rundown/${instance.rundown?.id}`)}
                          className="px-10 py-3 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary-500 transition-all shadow-xl shadow-primary-600/20 active:scale-95"
                        >
                          Orchestration Editor
                        </button>
                      )}
                    </div>
                  ))}
                  {instances.length === 0 && (
                    <div className="p-32 text-center text-slate-300">
                      <svg className="w-16 h-16 mx-auto mb-6 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-[11px] font-black uppercase tracking-[0.3em]">No scheduled instances detected.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-300 bg-white/50 rounded-[4rem] border-2 border-dashed border-slate-100">
               <svg className="w-20 h-20 mb-8 opacity-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
               <p className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-300">Select a Production Channel to Orchestrate</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
          <div className="absolute inset-0" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] p-12 border border-slate-200 animate-in zoom-in-95 duration-300">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Define Production Slot</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Initialize a new recurring broadcast segment</p>
            
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Show Name / Identity</label>
                <input 
                  type="text"
                  value={newShow.name}
                  onChange={(e) => setNewShow({...newShow, name: e.target.value})}
                  placeholder="e.g. Morning Sentinel News"
                  className="w-full bg-slate-50 border-0 rounded-[1.5rem] px-7 py-5 text-sm font-black text-slate-900 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Slot Description</label>
                <textarea 
                  value={newShow.description}
                  onChange={(e) => setNewShow({...newShow, description: e.target.value})}
                  placeholder="Summary of the production content..."
                  className="w-full bg-slate-50 border-0 rounded-[1.5rem] px-7 py-5 text-sm font-black text-slate-900 focus:ring-4 focus:ring-primary-500/10 transition-all min-h-[120px] placeholder:text-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Base Duration (Min)</label>
                  <input 
                    type="number"
                    value={newShow.defaultDuration}
                    onChange={(e) => setNewShow({...newShow, defaultDuration: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-50 border-0 rounded-[1.5rem] px-7 py-5 text-sm font-black text-slate-900 focus:ring-4 focus:ring-primary-500/10 transition-all"
                  />
                </div>
              </div>
              <div className="pt-10 flex gap-4">
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="flex-grow py-5 bg-slate-50 text-slate-400 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateShow} 
                  className="flex-grow py-5 bg-primary-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:bg-primary-500 transition-all shadow-2xl shadow-primary-600/20 active:scale-95"
                >
                  Confirm Definition
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}