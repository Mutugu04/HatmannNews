import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vortex } from '../services/api';
import { useStation } from '../contexts/StationContext';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from '../components/Editor/RichTextEditor';
import { GoogleGenAI } from "@google/genai";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function StoryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentStation } = useStation();
  const { user } = useAuth();
  const isNew = !id || id === 'new';

  // --- Core State ---
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [plainText, setPlainText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [source, setSource] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [status, setStatus] = useState('DRAFT');
  
  // --- UI/UX State ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // --- Presence Logic ---
  const [collaborators] = useState([
    { initials: 'AD', color: 'bg-emerald-500', name: 'Abbas Dalhatu' },
    { initials: 'SM', color: 'bg-blue-600', name: 'System Monitor' }
  ]);

  // Load Metadata & Data
  useEffect(() => {
    loadCategories();
    if (!isNew && id) {
      loadStory(id);
    }
  }, [id, isNew]);

  // Auto-Save Heartbeat
  useEffect(() => {
    if (isNew || !id || !title) return;
    const interval = setInterval(() => {
      handleSave(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [id, title, content, categoryId, priority]);

  const loadCategories = async () => {
    try {
      const response = await vortex.metadata.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const loadStory = async (storyId: string) => {
    try {
      setLoading(true);
      const response = await vortex.stories.getById(storyId);
      const story = response.data;
      setTitle(story.title || '');
      setContent(story.body?.content || '');
      setPlainText(story.plain_text || '');
      setWordCount(story.word_count || 0);
      setCategoryId(story.category_id || '');
      setPriority(story.priority || 'NORMAL');
      setStatus(story.status || 'DRAFT');
      setSource(story.source || '');
    } catch (error) {
      console.error('Narrative recovery failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (isAutoSave = false) => {
    if (!currentStation || !title) return;
    try {
      if (!isAutoSave) setSaving(true);
      
      const storyData = {
        title,
        body: { content },
        plain_text: plainText,
        word_count: wordCount,
        category_id: categoryId || null,
        priority,
        station_id: currentStation.id,
        status: isAutoSave ? status : status, // Preserve status on save
        source: source || 'NewsVortex Internal'
      };

      if (isNew) {
        const response = await vortex.stories.create(storyData);
        navigate(`/stories/${response.data.id}`, { replace: true });
      } else {
        await vortex.stories.update(id!, storyData);
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      if (!isAutoSave) setSaving(false);
    }
  };

  const triggerAiAssistant = async (mode: 'headline' | 'summarize' | 'refine') => {
    if (!plainText && mode !== 'headline') return;
    setAiProcessing(true);
    setShowAiAssistant(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = mode === 'headline' 
        ? `Generate 3 professional broadcast news headlines based on: ${title}`
        : `As an editorial assistant for HATMANN NewsVortex, ${mode === 'summarize' ? 'summarize this into a 30-word wire update' : 'refine the tone of this story to be more journalistic'}: ${plainText}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt
      });

      const text = response.text || '';
      setAiSuggestions(text.split('\n').filter(s => s.trim()));
    } catch (error) {
      console.error('Vortex AI Handshake Failed');
    } finally {
      setAiProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50">
       <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Synchronizing Archive Node...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex items-center gap-6">
          <Link to="/stories" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary-600 hover:shadow-xl transition-all border border-slate-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-1">
              {isNew ? 'New Narrative' : 'Edit Archive'}
            </h1>
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${saving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {saving ? 'Transmitting...' : lastSaved ? `Last Sync: ${lastSaved.toLocaleTimeString()}` : 'Ready for Input'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-[1.5rem] shadow-sm border border-slate-100">
          <div className="flex -space-x-2 mr-4 pl-2">
            {collaborators.map((c, i) => (
              <div key={i} className={`w-8 h-8 ${c.color} rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-sm`} title={c.name}>
                {c.initials}
              </div>
            ))}
          </div>
          <button 
            onClick={() => handleSave()}
            disabled={saving}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
          >
            {saving ? 'Syncing...' : 'Force Sync'}
          </button>
          <button 
            onClick={() => setStatus('PENDING')}
            className="px-8 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/20 active:scale-95"
          >
            Submit Review
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Workspace */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100">
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Primary Narrative Headline..."
              className="w-full text-4xl font-black text-slate-900 placeholder:text-slate-100 border-none focus:ring-0 mb-8 p-0"
            />
            
            <RichTextEditor 
              content={content}
              onChange={(html, text, words) => {
                setContent(html);
                setPlainText(text);
                setWordCount(words);
              }}
              placeholder="Develop the narrative here. Ensure high-fidelity reporting..."
            />
          </div>

          {/* Telemetry Footer */}
          <div className="bg-slate-900 rounded-[2rem] p-6 flex flex-wrap justify-between items-center text-white shadow-2xl">
            <div className="flex items-center gap-8">
              <div>
                <span className="text-4xl font-black mono tracking-tighter">{wordCount}</span>
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Total Words</span>
              </div>
              <div className="hidden md:block h-10 w-px bg-white/10"></div>
              <div className="hidden md:block">
                <span className="text-xl font-black mono tracking-tighter">~{Math.ceil(wordCount / 2.5)}s</span>
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Read Time</span>
              </div>
            </div>
            
            <div className="flex gap-2">
               <button onClick={() => triggerAiAssistant('headline')} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 transition-all">AI Headline</button>
               <button onClick={() => triggerAiAssistant('summarize')} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 transition-all">AI Summary</button>
            </div>
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Metadata Controller */}
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Node Metadata</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Narrative Category</label>
                <select 
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-xs font-black text-slate-900 focus:ring-4 focus:ring-primary-500/10 transition-all"
                >
                  <option value="">Select Channel</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Production Priority</label>
                <div className="grid grid-cols-2 gap-2">
                  {['NORMAL', 'HIGH', 'URGENT'].map(p => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${
                        priority === p 
                          ? 'bg-slate-900 text-white border-slate-900' 
                          : 'bg-white text-slate-400 border-slate-50 hover:border-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Source Attribution</label>
                <input 
                  type="text" 
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Reuters / Staff"
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-xs font-black text-slate-900 focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
              </div>
            </div>
          </div>

          {/* AI Assistant Sidebar */}
          {showAiAssistant && (
            <div className="bg-primary-600 text-white p-8 rounded-[3rem] shadow-2xl animate-in slide-in-from-right-10 duration-500 relative overflow-hidden">
               <div className="relative z-10">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Vortex AI Assistant</h3>
                    <button onClick={() => setShowAiAssistant(false)} className="text-white/50 hover:text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                 </div>

                 {aiProcessing ? (
                   <div className="py-12 text-center">
                      <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Consulting Gemini 3...</p>
                   </div>
                 ) : (
                   <div className="space-y-4">
                      {aiSuggestions.map((suggestion, idx) => (
                        <div key={idx} className="bg-white/10 p-4 rounded-2xl text-xs font-medium leading-relaxed group cursor-pointer hover:bg-white/20 transition-all" onClick={() => {
                          if (suggestion.includes('Headline:')) setTitle(suggestion.replace('Headline:', '').trim());
                          else setContent(prev => prev + `<p>${suggestion}</p>`);
                        }}>
                          {suggestion}
                        </div>
                      ))}
                      {aiSuggestions.length === 0 && <p className="text-[10px] font-black opacity-50 uppercase tracking-widest text-center py-8">No current suggestions</p>}
                   </div>
                 )}
               </div>
               <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
