
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
      <div className="p-