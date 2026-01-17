import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useStation } from '../contexts/StationContext';

interface WireService {
  id: string;
  name: string;
  slug: string;
  lastFetched: string | null;
  _count: { items: number };
}

interface WireItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  author: string;
  publishedAt: string;
  isRead: boolean;
  importedToId: string | null;
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
      const response = await api.get('/wire/services');
      // Fix: cast to any to resolve TypeScript union type mismatch from mock API shim
      setServices((response.data.data as any) || []);
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      let url = '/wire/items?limit=50';
      if (selectedService) {
        url += `&serviceId=${selectedService}`;
      }
      const response = await api.get(url);
      // Fix: cast to any to access items property on inconsistent mock response
      const resData = response.data.data as any;
      setItems(resData.items || []);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAll = async () => {
    setFetching(true);
    for (const service of services) {
      try {
        // Fix: provide required second argument for api.post mock call
        await api.post(`/wire/services/${service.id}/fetch`, {});
      } catch (error) {
        console.error(`Failed to fetch ${service.name}:`, error);
      }
    }
    await loadServices();
    await loadItems();
    setFetching(false);
  };

  const handleImport = async (itemId: string) => {
    if (!currentStation) {
      alert('Please select a station');
      return;
    }
    try {
      const response = await api.post(`/wire/items/${itemId}/import`, {
        stationId: currentStation.id,
      });
      // Fix: cast to any to access id property on mock API response
      const resData = response.data.data as any;
      navigate(`/stories/${resData.id}`);
    } catch (error) {
      console.error('Failed to import:', error);
      alert('Failed to import story');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Wire Intelligence</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time global news streams</p>
        </div>
        <button
          onClick={handleFetchAll}
          disabled={fetching}
          className="bg-primary-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 active:scale-95 disabled:opacity-50"
        >
          {fetching ? 'Syncing Feeds...' : 'Refresh All Channels'}
        </button>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap bg-white p-2 rounded-2xl shadow-sm border border-slate-100 inline-flex">
        <button
          onClick={() => setSelectedService('')}
          className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            !selectedService ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          Global Source
        </button>
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => setSelectedService(service.id)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              selectedService === service.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {service.name}
            <span className="opacity-50 font-mono">[{service._count.items}]</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Querying Satellites...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl border border-slate-100 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                    {item.service.name}
                  </span>
                  <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(item.publishedAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-primary-600 transition-colors tracking-tight">{item.title}</h3>
                <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-4 leading-relaxed">{item.summary}</p>
                <div className="flex items-center gap-6">
                   <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline flex items-center gap-1">
                     View Raw Content
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                   </a>
                   {item.author && <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">By {item.author}</span>}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end">
                {item.importedToId ? (
                  <Link 
                    to={`/stories/${item.importedToId}`}
                    className="px-8 py-3 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-slate-100 cursor-default"
                  >
                    Narrative Created
                  </Link>
                ) : (
                  <button
                    onClick={() => handleImport(item.id)}
                    className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                  >
                    Import to Archive
                  </button>
                )}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <svg className="w-12 h-12 text-slate-100 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.344 6.637c6.072-6.073 15.24-6.073 21.312 0" /></svg>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signal lost. No items available from this source.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
