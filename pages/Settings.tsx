import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useStation, Station } from '../contexts/StationContext';
import { api } from '../services/api';

type SettingTab = 'general' | 'account' | 'stations' | 'integrations';

interface WireService {
  id: string;
  name: string;
  slug: string;
  status: string;
  description: string;
  isError?: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const { stations, addStation } = useStation();
  const [activeTab, setActiveTab] = useState<SettingTab>('general');
  
  // Station State
  const [isAddingStation, setIsAddingStation] = useState(false);
  const [newStation, setNewStation] = useState<Omit<Station, 'id'>>({
    name: '',
    callSign: '',
    frequency: '',
    city: ''
  });

  // Wire Service State
  const [wireServices, setWireServices] = useState<WireService[]>([]);
  const [isAddingWire, setIsAddingWire] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [newWire, setNewWire] = useState({
    name: '',
    slug: 'rss',
    feedUrl: '',
    apiKey: ''
  });

  useEffect(() => {
    if (activeTab === 'integrations') {
      loadWireServices();
    }
  }, [activeTab]);

  const loadWireServices = async () => {
    try {
      const response = await api.get('/wire/services');
      setWireServices(response.data.data || []);
    } catch (error) {
      console.error('Failed to load wire services');
    }
  };

  const handleAddStation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addStation(newStation);
      setIsAddingStation(false);
      setNewStation({ name: '', callSign: '', frequency: '', city: '' });
    } catch (error) {
      alert('Failed to add station to the NewsVortex cluster.');
    }
  };

  const tabs: { id: SettingTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg> },
    { id: 'account', label: 'Account', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
    { id: 'stations', label: 'Stations', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg> },
    { id: 'integrations', label: 'Integrations', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">System Settings</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HATMANN NewsVortex Configuration Suite</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white border border-transparent'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-grow bg-white rounded-[3rem] shadow-xl border border-slate-100 p-8 md:p-12">
          {activeTab === 'general' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <section>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-primary-600 rounded-full"></span>
                  General Preferences
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">System Identity</label>
                    <input 
                      type="text" 
                      defaultValue="HATMANN NewsVortex Central"
                      className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 focus:ring-4 focus:ring-primary-500/10 transition-all"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <section>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-primary-600 rounded-full"></span>
                  My Intelligence Identity
                </h2>
                <div className="flex items-center gap-8 mb-10">
                  <div className="w-24 h-24 bg-primary-100 rounded-[2.5rem] flex items-center justify-center text-primary-600 text-3xl font-black">
                    {user?.firstName[0]}{user?.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{user?.firstName} {user?.lastName}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.email}</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'stations' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <section>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-primary-600 rounded-full"></span>
                    Station Management
                  </h2>
                  <button 
                    onClick={() => setIsAddingStation(true)}
                    className="px-6 py-3 bg-primary-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary-600/20"
                  >
                    Add Station
                  </button>
                </div>

                {isAddingStation && (
                  <form onSubmit={handleAddStation} className="mb-10 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 animate-in zoom-in-95 duration-200">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Initialize New Node</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Station Name</label>
                        <input type="text" required value={newStation.name} onChange={e => setNewStation({...newStation, name: e.target.value})} className="w-full bg-white border-0 rounded-xl px-5 py-3 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-primary-500/10 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Call Sign</label>
                        <input type="text" required value={newStation.callSign} onChange={e => setNewStation({...newStation, callSign: e.target.value.toUpperCase()})} className="w-full bg-white border-0 rounded-xl px-5 py-3 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-primary-500/10 transition-all" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setIsAddingStation(false)} className="flex-grow py-3 bg-white text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100">Cancel</button>
                      <button type="submit" className="flex-grow py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">Insert Node</button>
                    </div>
                  </form>
                )}

                <div className="grid gap-4">
                  {stations.map(station => (
                    <div key={station.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-slate-100 transition-all group">
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-600 font-black">
                            {station.callSign.substring(0,2)}
                         </div>
                         <div>
                            <h4 className="text-sm font-black text-slate-900">{station.name}</h4>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{station.frequency} • {station.city}</p>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
              <section>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-primary-600 rounded-full"></span>
                    Intelligence Streams
                  </h2>
                </div>
                <div className="grid gap-6">
                  {wireServices.map((service) => (
                    <IntegrationCard key={service.id} name={service.name} status={service.status} description={service.description} icon={<div className="w-10 h-10 bg-slate-700 text-white rounded-xl flex items-center justify-center font-black">{service.name.charAt(0)}</div>} />
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface IntegrationCardProps {
  name: string;
  status: string;
  description: string;
  icon: React.ReactNode;
  isError?: boolean;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ name, status, description, icon, isError }) => {
  return (
    <div className="flex items-center justify-between p-6 border-2 border-slate-50 rounded-3xl hover:border-primary-100 transition-all group">
      <div className="flex items-center gap-6">
        {icon}
        <div>
          <h4 className="text-sm font-black text-slate-900">{name}</h4>
          <p className="text-[10px] text-slate-400 font-medium">{description}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${isError ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
          {status}
        </span>
      </div>
    </div>
  );
}