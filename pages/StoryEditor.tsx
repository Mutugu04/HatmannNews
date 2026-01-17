
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// @ts-ignore
import { vortex, api } from '../services/api';
import { useStation } from '../contexts/StationContext';
import RichTextEditor from '../components/Editor/RichTextEditor';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function StoryEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentStation } = useStation();
  const isNew = !id || id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [plainText, setPlainText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [source, setSource] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [status, setStatus] = useState('DRAFT');
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [collaborators, setCollaborators] = useState<{ initials: string; color: string }[]>([]);
  const [presenceMsg, setPresenceMsg] = useState<string | null>(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
    
    // Simulate WebSocket presence logic
    if (!isNew) {
      setTimeout(() => {
        setCollaborators([
          { initials: 'SC', color: 'bg-emerald-500' },
          { initials: 'JD', color: 'bg-blue-500' }
        ]);
        setPresenceMsg("sarah.c joined the narrative room");
        setTimeout(() => setPresenceMsg(null), 4000);
      }, 1500);
    }
  }, []);

  // Load existing story
  useEffect(() => {
    if (!isNew && id) {
      loadStory(id);
    }
  }, [id, isNew]);

  // Auto-save logic
  useEffect(() => {
    if (isNew || !id) return;
    const interval = setInterval(() => {
      if (title && content) {
        handleSave(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [id, title, content]);

  // Use vortex service for category metadata
  const loadCategories = async () => {
    try {
      const response = await vortex.metadata.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      setCategories([
        { id: '1', name: 'Politics', slug: 'politics' },
        { id: '2', name: 'Business', slug: 'business' },
        { id: '3', name: 'Local News', slug: 'local' },
        { id: '4', name: 'Technology', slug: 'tech' }
      ]);
    }
  };

  // Use vortex service for fetching story details by ID
  const loadStory = async (storyId: string) => {
    try {
      setLoading(true);
      const response = await vortex.stories.getById(storyId);
      const story = response.data;
      setTitle(story.title || '');
      setContent(story.body?.content || story.body || '');
      setPlainText(story.plainText || '');
      setWordCount(story.wordCount || 0);
      setCategoryId(story.categoryId || '');
      setSource(story.source || '');
      setPriority(story.priority || 'NORMAL');
      setStatus(story.status || 'DRAFT');
    } catch (error) {
      console.error('Failed to load story:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (html: string, text: string, words: number) => {
    setContent(html);
    setPlainText(text);
    setWordCount(words);
  };

  // Use vortex service for creating or updating stories
  const handleSave = async (isAutoSave = false) => {
    if (!currentStation) return;
    try {
      if (!isAutoSave) setSaving(true);
      
      const data = {
        title,
        body: { content },
        categoryId: categoryId || undefined,
        source: source || undefined,
        priority,
        stationId: currentStation.id,
      };

      if (isNew) {
        const response = await vortex.stories.create(data);
        if (!isAutoSave) {
          navigate(`/stories/${response.data.id}`);
        }
      } else {
        await vortex.stories.update(id!, data);
      }
      
      setLastSaved(new Date());
    } catch (error) {
      if (!isAutoSave) alert('Failed to save story');
    } finally {
      if (!isAutoSave) setSaving(false);
    }
  };

  // Use vortex service for submitting story status
  const handleSubmit = async () => {
    try {
      setSaving(true);
      await vortex.stories.update(id!, { status: 'PENDING' });
      alert('Story submitted for approval');
      navigate('/stories');
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="font-black uppercase tracking-[0.5em] text-slate-400 text-xs">Synchronizing Archive...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 relative">
      {/* Real-time Presence Notification */}
      {presenceMsg && (
        <div className="fixed top-24 right-8 z-[200] animate-in slide-in-from-right-full fade-in duration-500">
           <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">{presenceMsg}</span>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link to="/stories" className="text-primary-600 hover:text-primary-700 font-black uppercase text-[10px] tracking-widest flex items-center gap-1 bg-primary-50 px-3 py-1 rounded-full transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              Archives
            </Link>
            {lastSaved && (
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Auto-synced: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            
            {/* Collaborative Presence Widget */}
            {!isNew && (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-100">
                 <div className="flex -space-x-2">
                    {collaborators.map((c, idx) => (
                      <div key={idx} className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white ${c.color} shadow-sm`}>
                        {c.initials}
                      </div>
                    ))}
                 </div>
                 <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Live Presence</span>
                 </div>
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            {isNew ? 'New Transmission' : 'Modify Narrative'}
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="px-6 py-3 border-2 border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            {saving ? 'Syncing...' : 'Save Draft'}
          </button>
          {!isNew && status === 'DRAFT' && (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              Submit for Approval
            </button>
          )}
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="px-8 py-3 bg-primary-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 active:scale-95 disabled:opacity-50"
          >
            Broadcast Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100">
            <div className="space-y-10">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 group-focus-within:text-primary-500 transition-colors">Headline Intelligence</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The transmission needs a title..."
                  className="w-full text-4xl font-black text-slate-900 border-0 border-b-2 border-slate-100 focus:border-primary-500 focus:ring-0 transition-all p-0 pb-4 placeholder:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Narrative Body</label>
                <RichTextEditor
                  content={content}
                  onChange={handleEditorChange}
                  placeholder="Start writing the narrative here..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 sticky top-8">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] mb-8 border-b border-slate-50 pb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-600"></span>
              Transmission Metadata
            </h3>

            <div className="space-y-8">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-[11px] font-black text-slate-700 focus:ring-4 focus:ring-primary-500/10 appearance-none transition-all cursor-pointer"
                >
                  <option value="">UNCATEGORIZED</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Intelligence Source</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Agency or individual..."
                  className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-[11px] font-black text-slate-700 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Transmission Priority</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border-2 ${
                          priority === p
                            ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/20'
                            : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                  <span>Intelligence Volume</span>
                  <span className="text-slate-900">{wordCount} Words</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                    style={{ width: `${Math.min(100, wordCount / 10)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-3 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                  <span>Status: {status}</span>
                  <span>Station: {currentStation?.callSign}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary-600/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h4 className="text-white font-black uppercase text-[10px] tracking-widest">Sentinel Note</h4>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed font-bold italic">
                "Real-time collaboration is active. All narrative streams are synchronized via the WebSocket cluster."
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
