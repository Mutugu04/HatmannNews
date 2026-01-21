
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vortex } from '../services/SupabaseService';
import { useStation } from '../contexts/StationContext';

interface WireService {
  id: string;
  name: string;
  slug: string;
  status: string;
  description: string;
}

interface WireItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  author: string;
  publishedAt: string;
  service: { name: string; slug: string };
}

export default function WireFeed() {
  const { currentStation } = useStation();
  const navigate = useNavigate();
  const [services, setServices] = useState<WireService[]>([]);
  const [items, setItems] = useState<WireItem[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    loadItems();
  }, [selectedService]);

  const loadServices = async () => {
    try {
      const response = await vortex.wire.getServices();
      setServices(response.data || []);
    } catch (error) {
      console.error('Failed to load wire services:', error);
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await vortex.wire.getItems(selectedService || undefined);
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAll = async () => {
    setFetching(true);
    // Simulate satellite handshakes
    await new Promise(resolve => setTimeout(resolve, 2000));
    await loadItems();
    setFetching(false);
  };

  const handleImport = async (item: WireItem) => {
    if (!currentStation) {
      alert('Please select a local station node.');
      return;
    }
    try {
      const response = await vortex.wire.importToStory(item, currentStation.id);
      navigate(`/stories/${response.data.id}`);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import narrative intelligence.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Wire Intelligence</h1>
          <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">Real-time Global Inbound Aggregate</p>
        </div>
        <button
          onClick={handleFetchAll}
          disabled={fetching}
          className="bg-slate-900 text-white px-10 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2"
        >
          {fetching ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Synchronizing Satellites...
            </>
          ) : 'Refresh All Channels'}
        </button>
      </div>

      <div className="flex gap-2 mb-10 flex-wrap bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 inline-flex" role="tablist" aria-label="Wire service filters">
        <button
          onClick={() => setSelectedService('')}
          role="tab"
          aria-selected={!selectedService}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${!selectedService ? 'bg-primary-600 text-black shadow-xl shadow-primary-600/20' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
        >
          Aggregated Source
        </button>
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setSelectedService(service.slug)}
            role="tab"
            aria-selected={selectedService === service.slug}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${selectedService === service.slug ? 'bg-primary-600 text-black shadow-xl shadow-primary-600/20' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
          >
            {service.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-40" role="status" aria-live="polite">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" aria-hidden="true"></div>
          <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Querying Satellite Gateway...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-2xl border border-slate-100 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-10 group">
              <div className="flex-grow">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[12px] font-black">
                    {item.service.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-primary-600 block">
                      {item.service.name}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {new Date(item.publishedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-primary-600 transition-colors tracking-tighter leading-tight">
                  {item.title}
                </h3>
                <p className="text-base text-slate-500 font-medium line-clamp-2 mb-6 leading-relaxed max-w-4xl">
                  {item.summary}
                </p>
                <div className="flex items-center gap-8">
                  <a href={item.link} className="text-xs font-black text-slate-600 uppercase tracking-widest hover:text-slate-900 flex items-center gap-2 border-b-2 border-slate-100 pb-1 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded" target="_blank" rel="noopener noreferrer">
                    View Original Metadata
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    <span className="sr-only">(opens in new tab)</span>
                  </a>
                  {item.author && <span className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">Source: {item.author}</span>}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end">
                <button
                  onClick={() => handleImport(item)}
                  className="px-10 py-4 bg-primary-600 text-black text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-primary-500 transition-all shadow-xl shadow-primary-600/30 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                >
                  Import to Archive
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-40 bg-white rounded-[4rem] border-4 border-dashed border-slate-100">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8" aria-hidden="true">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.344 6.637c6.072-6.073 15.24-6.073 21.312 0" /></svg>
              </div>
              <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">No Intelligence Nodes available in this channel.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
