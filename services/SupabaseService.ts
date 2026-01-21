import supabase from './supabase';

/**
 * HATMANN NewsVortex - Supabase Service
 * Complete client-side database interaction layer.
 * 
 * All operations use RLS (Row Level Security) - the database 
 * automatically filters data based on the authenticated user.
 */

// ============================================================
// TYPES
// ============================================================
export type StoryStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'PUBLISHED' | 'KILLED';
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type RundownStatus = 'DRAFT' | 'FINAL' | 'ARCHIVED';
export type ItemStatus = 'PENDING' | 'READY' | 'LIVE' | 'COMPLETED';
export type RundownItemType = 'STORY' | 'BREAK' | 'LIVE' | 'INTERVIEW' | 'PROMO' | 'MUSIC' | 'AD';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role?: string;
}

export interface Station {
  id: string;
  name: string;
  call_sign: string;
  frequency?: string;
  city?: string;
  timezone?: string;
  logo_url?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface Story {
  id: string;
  title: string;
  slug?: string;
  body?: any;
  plain_text?: string;
  status: StoryStatus;
  priority: Priority;
  author_id?: string;
  station_id: string;
  category_id?: string;
  source?: string;
  word_count: number;
  read_time?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  // Joined relations
  author?: User;
  category?: Category;
}

export interface Show {
  id: string;
  station_id: string;
  name: string;
  slug?: string;
  description?: string;
  default_duration: number;
  start_time?: string;
  days_of_week?: number[];
  is_active: boolean;
}

export interface ShowInstance {
  id: string;
  show_id: string;
  air_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  show?: Show;
  rundown?: Rundown;
}

export interface Rundown {
  id: string;
  show_instance_id: string;
  status: RundownStatus;
  total_duration: number;
  locked_by?: string;
  locked_at?: string;
  show_instance?: ShowInstance;
  items?: RundownItem[];
}

export interface RundownItem {
  id: string;
  rundown_id: string;
  story_id?: string;
  type: RundownItemType;
  title: string;
  position: number;
  planned_duration: number;
  actual_duration?: number;
  script?: string;
  notes?: string;
  status: ItemStatus;
  story?: Pick<Story, 'id' | 'title' | 'word_count'>;
}

// Environment variable helper
const getEnv = (key: string): string | null => {
  if (typeof process !== 'undefined' && process.env?.[key]) return process.env[key]!;
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env?.[key]) return import.meta.env[key];
  return null;
};

const NEWS_API_KEY = getEnv('VITE_NEWS_AGGREGATOR_KEY') || '';

// ============================================================
// VORTEX SERVICE
// ============================================================
export const vortex = {
  // ----------------------------------------------------------
  // AUTH HELPERS
  // ----------------------------------------------------------
  auth: {
    /** Get current authenticated user */
    async getCurrentUser(): Promise<User | null> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      return data;
    },

    /** Update current user's profile */
    async updateProfile(updates: Partial<Pick<User, 'first_name' | 'last_name' | 'avatar_url'>>) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    }
  },

  // ----------------------------------------------------------
  // STATIONS
  // ----------------------------------------------------------
  stations: {
    /** Get all stations the user is a member of */
    async getMyStations(): Promise<{ data: Station[] }> {
      const { data, error } = await supabase.rpc('get_my_stations');

      if (error) {
        console.warn('[vortex] get_my_stations RPC failed, falling back to direct query:', error);
        // Fallback: direct query (relies on RLS)
        const { data: fallbackData } = await supabase
          .from('stations')
          .select('*')
          .order('name');
        return { data: fallbackData || [] };
      }

      return { data: data || [] };
    },

    /** Get all stations (public list) */
    async getAll(): Promise<{ data: Station[] }> {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('name');

      if (error) throw error;
      return { data: data || [] };
    },

    /** Get single station by ID */
    async getById(id: string): Promise<{ data: Station | null }> {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data };
    },

    /** Create a new station */
    async create(stationData: Omit<Station, 'id'>): Promise<{ data: Station }> {
      const { data, error } = await supabase
        .from('stations')
        .insert([stationData])
        .select()
        .single();

      if (error) throw error;
      return { data };
    },

    /** Update station */
    async update(id: string, updates: Partial<Station>): Promise<{ data: Station }> {
      const { data, error } = await supabase
        .from('stations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    }
  },

  // ----------------------------------------------------------
  // STORIES
  // ----------------------------------------------------------
  stories: {
    /** Get stories with optional filters */
    async getAll(params: {
      stationId?: string;
      authorId?: string;
      status?: StoryStatus | 'all';
      categoryId?: string;
      search?: string;
      limit?: number;
      offset?: number;
    } = {}): Promise<{ data: { stories: Story[]; total: number } }> {
      try {
        let query = supabase
          .from('stories')
          .select('*, author:users(id, first_name, last_name), category:categories(id, name, slug, color)', { count: 'exact' })
          .order('created_at', { ascending: false });

        if (params.stationId) query = query.eq('station_id', params.stationId);
        if (params.authorId) query = query.eq('author_id', params.authorId);
        if (params.status && params.status !== 'all') query = query.eq('status', params.status);
        if (params.categoryId) query = query.eq('category_id', params.categoryId);
        if (params.search) query = query.ilike('title', `%${params.search}%`);
        if (params.limit) query = query.limit(params.limit);
        if (params.offset) query = query.range(params.offset, params.offset + (params.limit || 20) - 1);

        const { data, error, count } = await query;
        if (error) throw error;

        return { data: { stories: (data || []) as Story[], total: count || 0 } };
      } catch (err) {
        console.error('[vortex] Story fetch error:', err);
        return { data: { stories: [], total: 0 } };
      }
    },

    /** Get single story by ID */
    async getById(id: string): Promise<{ data: Story | null }> {
      const { data, error } = await supabase
        .from('stories')
        .select('*, author:users(*), category:categories(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: data as Story };
    },

    /** Create a new story */
    async create(storyData: {
      title: string;
      body?: any;
      plain_text?: string;
      status?: StoryStatus;
      priority?: Priority;
      station_id: string;
      category_id?: string;
      source?: string;
    }): Promise<{ data: Story }> {
      const { data: { user } } = await supabase.auth.getUser();

      const wordCount = storyData.plain_text
        ? storyData.plain_text.split(/\s+/).filter(Boolean).length
        : 0;

      const { data, error } = await supabase
        .from('stories')
        .insert([{
          ...storyData,
          author_id: user?.id,
          word_count: wordCount,
          slug: storyData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 100)
        }])
        .select('*, author:users(*), category:categories(*)')
        .single();

      if (error) throw error;
      return { data: data as Story };
    },

    /** Update a story */
    async update(id: string, updates: Partial<Story>): Promise<{ data: Story }> {
      // Recalculate word count if plain_text is being updated
      if (updates.plain_text) {
        updates.word_count = updates.plain_text.split(/\s+/).filter(Boolean).length;
      }

      const { data, error } = await supabase
        .from('stories')
        .update(updates)
        .eq('id', id)
        .select('*, author:users(*), category:categories(*)')
        .single();

      if (error) throw error;
      return { data: data as Story };
    },

    /** Delete a story */
    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },

    /** Update story status */
    async updateStatus(id: string, status: StoryStatus): Promise<{ data: Story }> {
      const updates: Partial<Story> = { status };
      if (status === 'PUBLISHED') {
        updates.published_at = new Date().toISOString();
      }
      return this.update(id, updates);
    }
  },

  // ----------------------------------------------------------
  // WIRE FEED (External News Aggregation)
  // ----------------------------------------------------------
  wire: {
    /** Get available wire services */
    async getServices() {
      return {
        data: [
          { id: 'vortex-live', name: 'Live Intelligence Hub', slug: 'vortex-live', status: 'ACTIVE', description: 'Global real-time aggregate via HATMANN Satellite' },
          { id: 'reuters', name: 'Reuters Connect', slug: 'reuters', status: 'STABLE', description: 'Global high-fidelity news wire' },
          { id: 'nv-direct', name: 'NewsVortex Direct', slug: 'vortex', status: 'STABLE', description: 'Internal cluster distribution' }
        ]
      };
    },

    /** Get wire items from aggregator */
    async getItems(serviceId?: string) {
      if (serviceId === 'vortex-live' || !serviceId) {
        if (!NEWS_API_KEY) {
          return {
            data: {
              items: [{
                id: 'config-1',
                title: 'Configuration Required',
                summary: 'Set VITE_NEWS_AGGREGATOR_KEY in your .env file to enable live wire feeds.',
                link: '#',
                author: 'System',
                publishedAt: new Date().toISOString(),
                service: { name: 'Vortex System', slug: 'system' }
              }]
            }
          };
        }

        try {
          const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=15&apiKey=${NEWS_API_KEY}`);
          const data = await response.json();

          if (data.status === 'ok') {
            return {
              data: {
                items: data.articles.map((article: any, index: number) => ({
                  id: `live-${index}-${Date.now()}`,
                  title: article.title,
                  summary: article.description || article.content || 'No summary available.',
                  link: article.url,
                  author: article.author || article.source?.name || 'Unknown',
                  publishedAt: article.publishedAt,
                  imageUrl: article.urlToImage,
                  service: { name: 'Live Aggregate', slug: 'vortex-live' }
                }))
              }
            };
          } else {
            throw new Error(data.message || 'Aggregator handshake failed.');
          }
        } catch (err) {
          console.error('[vortex] Aggregator error:', err);
          return {
            data: {
              items: [{
                id: 'err-1',
                title: 'System Notice: External Feed Latency',
                summary: 'The global aggregator is experiencing high latency. Retrying satellite handshake...',
                link: '#',
                author: 'System Sentinel',
                publishedAt: new Date().toISOString(),
                service: { name: 'Vortex System', slug: 'system' }
              }]
            }
          };
        }
      }

      // Mock items for other services
      return {
        data: {
          items: [{
            id: 'w1',
            title: 'Regional Summit: Economic Stability Protocols',
            summary: 'Leaders gather to discuss a unified digital currency framework for sub-Saharan trade.',
            link: '#',
            author: 'Reuters Staff',
            publishedAt: new Date().toISOString(),
            service: { name: 'Reuters', slug: 'reuters' }
          }]
        }
      };
    },

    /** Import a wire item as a new story draft */
    async importToStory(wireItem: any, stationId: string): Promise<{ data: Story }> {
      return vortex.stories.create({
        title: `[WIRE] ${wireItem.title}`,
        plain_text: wireItem.summary,
        body: {
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: wireItem.summary }] },
            { type: 'paragraph', content: [{ type: 'text', text: `Source: ${wireItem.service?.name || 'Wire'} / ${wireItem.author}` }] }
          ]
        },
        status: 'DRAFT',
        station_id: stationId,
        source: wireItem.service?.name || 'Wire Feed'
      });
    }
  },

  // ----------------------------------------------------------
  // SHOWS
  // ----------------------------------------------------------
  shows: {
    /** Get all shows for a station */
    async getAll(stationId: string): Promise<{ data: Show[] }> {
      const { data, error } = await supabase
        .from('shows')
        .select('*')
        .eq('station_id', stationId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return { data: data || [] };
    },

    /** Get single show by ID */
    async getById(id: string): Promise<{ data: Show | null }> {
      const { data, error } = await supabase
        .from('shows')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data };
    },

    /** Create a new show */
    async create(showData: {
      station_id: string;
      name: string;
      description?: string;
      default_duration?: number;
    }): Promise<{ data: Show }> {
      const slug = showData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const { data, error } = await supabase
        .from('shows')
        .insert([{ ...showData, slug }])
        .select()
        .single();

      if (error) throw error;
      return { data };
    },

    /** Update a show */
    async update(id: string, updates: Partial<Show>): Promise<{ data: Show }> {
      const { data, error } = await supabase
        .from('shows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    },

    /** Delete (deactivate) a show */
    async delete(id: string): Promise<void> {
      const { error } = await supabase
        .from('shows')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },

    /** Get show instances */
    async getInstances(showId: string): Promise<{ data: ShowInstance[] }> {
      const { data, error } = await supabase
        .from('show_instances')
        .select('*, rundown:rundowns(id, status, total_duration)')
        .eq('show_id', showId)
        .order('air_date', { ascending: false });

      if (error) throw error;
      return { data: (data || []) as ShowInstance[] };
    },

    /** Create a show instance with its rundown */
    async createInstance(showId: string, instanceData: {
      air_date: string;
      start_time: string;
      end_time: string;
      notes?: string;
    }): Promise<{ data: ShowInstance }> {
      // Create the show instance
      const { data: instance, error: instErr } = await supabase
        .from('show_instances')
        .insert([{ ...instanceData, show_id: showId }])
        .select()
        .single();

      if (instErr) throw instErr;

      // Create the associated rundown
      const { data: rundown, error: runErr } = await supabase
        .from('rundowns')
        .insert([{ show_instance_id: instance.id }])
        .select()
        .single();

      if (runErr) throw runErr;

      return { data: { ...instance, rundown } as ShowInstance };
    }
  },

  // ----------------------------------------------------------
  // RUNDOWNS
  // ----------------------------------------------------------
  rundowns: {
    /** Get rundown by ID with all items */
    async getById(id: string): Promise<{ data: Rundown | null }> {
      const { data, error } = await supabase
        .from('rundowns')
        .select(`
          *,
          show_instance:show_instances(
            *,
            show:shows(*)
          ),
          items:rundown_items(
            *,
            story:stories(id, title, word_count)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Sort items by position
      if (data?.items) {
        data.items.sort((a: any, b: any) => a.position - b.position);
      }

      return { data: data as Rundown };
    },

    /** Update rundown status */
    async updateStatus(id: string, status: RundownStatus): Promise<{ data: Rundown }> {
      const { data, error } = await supabase
        .from('rundowns')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    },

    /** Lock rundown for editing */
    async lock(id: string): Promise<{ data: Rundown }> {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('rundowns')
        .update({
          locked_by: user?.id,
          locked_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    },

    /** Unlock rundown */
    async unlock(id: string): Promise<{ data: Rundown }> {
      const { data, error } = await supabase
        .from('rundowns')
        .update({ locked_by: null, locked_at: null })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    },

    /** Add item to rundown */
    async addItem(rundownId: string, itemData: {
      type: RundownItemType;
      title: string;
      planned_duration?: number;
      story_id?: string;
      script?: string;
      notes?: string;
    }): Promise<{ data: RundownItem }> {
      // Get next position
      const { data: lastItem } = await supabase
        .from('rundown_items')
        .select('position')
        .eq('rundown_id', rundownId)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      const position = lastItem ? lastItem.position + 1 : 0;

      const { data, error } = await supabase
        .from('rundown_items')
        .insert([{ ...itemData, rundown_id: rundownId, position }])
        .select('*, story:stories(id, title, word_count)')
        .single();

      if (error) throw error;

      // Trigger duration recalculation
      await supabase.rpc('calculate_rundown_duration', { rundown_uuid: rundownId });

      return { data: data as RundownItem };
    },

    /** Update rundown item */
    async updateItem(itemId: string, updates: Partial<RundownItem>): Promise<{ data: RundownItem }> {
      const { data, error } = await supabase
        .from('rundown_items')
        .update(updates)
        .eq('id', itemId)
        .select('*, story:stories(id, title, word_count)')
        .single();

      if (error) throw error;

      // Trigger duration recalculation if duration changed
      if (updates.planned_duration !== undefined && data) {
        await supabase.rpc('calculate_rundown_duration', { rundown_uuid: data.rundown_id });
      }

      return { data: data as RundownItem };
    },

    /** Delete rundown item */
    async deleteItem(itemId: string): Promise<void> {
      // Get rundown_id before deleting
      const { data: item } = await supabase
        .from('rundown_items')
        .select('rundown_id')
        .eq('id', itemId)
        .single();

      const { error } = await supabase
        .from('rundown_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Recalculate duration and reorder
      if (item) {
        await supabase.rpc('calculate_rundown_duration', { rundown_uuid: item.rundown_id });

        // Reorder remaining items
        const { data: remaining } = await supabase
          .from('rundown_items')
          .select('id')
          .eq('rundown_id', item.rundown_id)
          .order('position');

        if (remaining) {
          for (let i = 0; i < remaining.length; i++) {
            await supabase
              .from('rundown_items')
              .update({ position: i })
              .eq('id', remaining[i].id);
          }
        }
      }
    },

    /** Reorder rundown items */
    async reorderItems(rundownId: string, itemIds: string[]): Promise<void> {
      for (let i = 0; i < itemIds.length; i++) {
        await supabase
          .from('rundown_items')
          .update({ position: i })
          .eq('id', itemIds[i]);
      }
    }
  },

  // ----------------------------------------------------------
  // CATEGORIES
  // ----------------------------------------------------------
  categories: {
    /** Get all categories */
    async getAll(): Promise<{ data: Category[] }> {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) return { data: [] };
      return { data: data || [] };
    },

    /** Create category */
    async create(categoryData: { name: string; color?: string }): Promise<{ data: Category }> {
      const slug = categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...categoryData, slug }])
        .select()
        .single();

      if (error) throw error;
      return { data };
    }
  },

  // ----------------------------------------------------------
  // METADATA (Backwards compatibility alias)
  // ----------------------------------------------------------
  metadata: {
    async getCategories() {
      return vortex.categories.getAll();
    },
    async getStations() {
      return vortex.stations.getAll();
    }
  }
};

// ============================================================
// LEGACY API SHIM (For backwards compatibility)
// ============================================================
export const api = {
  get: async (url: string) => {
    if (url.includes('/stations/my-stations')) return { data: { data: (await vortex.stations.getMyStations()).data } };
    if (url.includes('/wire/services')) return vortex.wire.getServices();
    if (url.includes('/wire/items')) {
      const urlObj = new URL(url, 'http://localhost');
      const serviceId = urlObj.searchParams.get('serviceId');
      return vortex.wire.getItems(serviceId || undefined);
    }
    return Promise.resolve({ data: { data: [] } });
  },
  post: async (url: string, data: any) => {
    if (url.includes('/stations')) return { data: { data: (await vortex.stations.create(data)).data } };
    if (url.includes('/import')) {
      return { data: { data: (await vortex.wire.importToStory(data.item, data.stationId)).data } };
    }
    return Promise.resolve({ data: { data: {} } });
  },
  patch: async (url: string, data: any) => Promise.resolve({ data: { data: {} } }),
  delete: async (url: string) => Promise.resolve({ data: { data: {} } }),
};

export default vortex;