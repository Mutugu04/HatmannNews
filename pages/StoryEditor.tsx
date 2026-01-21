import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vortex } from '../services/SupabaseService';
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
          { initials: 'SC', color: 'bg-emerald-500 shadow-emerald-500/20' },
          { initials: 'JD', color: 'bg-blue-600 shadow-blue-500/20' }
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
      if (!story) return;
      setTitle(story.title || '');
      setContent(story.body?.content || story.body || '');
      setPlainText(story.plain_text || '');
      setWordCount(story.word_count || 0);
      setCategoryId(story.category_id || '');
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

  const handleSave = async (isAutoSave = false) => {
    if (!currentStation) return;
    try {
      if (!isAutoSave) setSaving(true);

      const data = {
        title,
        body: { content },
        plain_text: plainText,
        category_id: categoryId || undefined,
        source: source || undefined,
        priority,
        station_id: currentStation.id,
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
      <div className="p-32 text-center" role="status" aria-live="polite">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-2xl shadow-primary-500/20" aria-hidden="true"></div>
        <div className="font-black uppercase tracking-[0.3em] text-slate-600 text-sm">Synchronizing Archive...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 relative animate-in fade-in duration-700">
      {/* Real-time Presence Notification */}
      {presenceMsg && (
        <div className="fixed top-24 right-8 z-[200] animate-in slide-in-from-right-full fade-in duration-500">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] shadow-2xl border border-white/10 flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] font-black uppercase tracking-widest">{presenceMsg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Link to="/stories" className="text-primary-700 hover:text-white font-black uppercase text-xs tracking-widest flex items-center gap-2 bg-primary-50 hover:bg-primary-600 px-5 py-2 rounded-full border border-primary-100 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
              Archives
            </Link>
            {lastSaved && (
              <span className="text-xs font-black text-slate-600 uppercase tracking-[0.15em] bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                Auto-synced: {lastSaved.toLocaleTimeString()}
              </span>
            )}

            {!isNew && (
              <div className="flex items-center gap-4 ml-4 pl-6 border-l-2 border-slate-100">
                <div className="flex -space-x-3">
                  {collaborators.map((c, idx) => (
                    <div key={idx} className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-black text-white ${c.color} shadow-lg transition-transform hover:translate-y-[-4px]`}>
                      {c.initials}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest"><span className="sr-only">Status: </span>Active Cluster</span>
                </div>
              </div>
            )}
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
            {isNew ? 'New Transmission' : 'Modify Narrative'}
          </h1>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 font-black uppercase tracking-widest text-sm rounded-[1.5rem] hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            {saving ? 'Syncing...' : 'Save Draft'}
          </button>
          {!isNew && status === 'DRAFT' && (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-sm rounded-[1.5rem] hover:bg-slate-800 transition-all shadow-2xl active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2"
            >
              Submit for Approval
            </button>
          )}
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="px-10 py-4 bg-primary-600 text-white font-black uppercase tracking-widest text-sm rounded-[1.5rem] hover:bg-primary-500 transition-all shadow-2xl shadow-primary-600/30 active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
          >
            Broadcast Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl border border-slate-100">
            <div className="space-y-12">
              <div className="group">
                <label htmlFor="headline" className="block text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6 group-focus-within:text-primary-600 transition-colors">Narrative Headline</label>
                <input
                  id="headline"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Initialize headline..."
                  className="w-full text-5xl font-black text-slate-900 border-0 border-b-[4px] border-slate-100 focus:border-primary-600 focus:ring-0 transition-all p-0 pb-6 placeholder:text-slate-300"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Transmission Body</label>
                <RichTextEditor
                  content={content}
                  onChange={handleEditorChange}
                  placeholder="Compose narrative intelligence..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 sticky top-10">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] mb-10 border-b-2 border-slate-50 pb-6 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-600 shadow-[0_0_10px_rgba(2,132,199,0.5)]"></span>
              Node Metadata
            </h3>

            <div className="space-y-10">
              <div>
                <label htmlFor="category" className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Target Channel</label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border-0 rounded-[1.5rem] px-7 py-5 text-sm font-black text-slate-900 focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 appearance-none transition-all cursor-pointer shadow-inner"
                >
                  <option value="">UNCATEGORIZED</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="source" className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Source Origin</label>
                <input
                  id="source"
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Agency / Unit..."
                  className="w-full bg-slate-50 border-0 rounded-[1.5rem] px-7 py-5 text-sm font-black text-slate-900 focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 transition-all placeholder:text-slate-400 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Priority Level</label>
                <div className="grid grid-cols-2 gap-3" role="group" aria-label="Priority level selection">
                  {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      aria-pressed={priority === p}
                      className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${priority === p
                          ? 'bg-primary-600 text-white border-primary-600 shadow-xl shadow-primary-600/30'
                          : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-10 border-t-2 border-slate-50">
                <div className="flex items-center justify-between text-xs font-black text-slate-600 mb-3 uppercase tracking-widest">
                  <span>Intelligence Vol.</span>
                  <span className="text-slate-900 mono">{wordCount} W</span>
                </div>
                <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100" role="progressbar" aria-valuenow={Math.min(100, Math.round(wordCount / 12))} aria-valuemin={0} aria-valuemax={100} aria-label="Word count progress">
                  <div
                    className="h-full bg-primary-600 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(2,132,199,0.4)]"
                    style={{ width: `${Math.min(100, wordCount / 12)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Status</span>
                    <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{status}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Frequency</span>
                    <span className="text-sm font-black text-primary-600 uppercase tracking-tight">{currentStation?.callSign}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}