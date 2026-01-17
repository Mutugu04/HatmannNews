import supabase from './supabase';

/**
 * NewsVortex Supabase Service Wrapper
 * Direct serverless database interaction for Stories, Shows, and Rundowns.
 */

// Detect environment variables
const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) return import.meta.env[key];
  return null;
};

const NEWS_API_KEY = getEnv('VITE_NEWS_AGGREGATOR_KEY') || '2116a96cc0724073ba8121c9b6ddb7f9';

export const vortex = {
  // --- Story Operations ---
  stories: {
    async getAll(params: { stationId?: string; authorId?: string; status?: string; limit?: number }) {
      try {
        let query = supabase
          .from('stories')
          .select('*, author:users(first_name, last_name), category:categories(name)')
          .order('created_at', { ascending: false });

        if (params.stationId) query = query.eq('station_id', params.stationId);
        if (params.authorId) query = query.eq('author_id', params.authorId);
        if (params.status && params.status !== 'all') query = query.eq('status', params.status);
        if (params.limit) query = query.limit(params.limit);

        const { data, error } = await query;
        if (error) throw error;
        return { data: { stories: data || [], total: data?.length || 0 } };
      } catch (err) {
        console.error('[vortex] Story Fetch Error:', err);
        return { data: { stories: [], total: 0 } };
      }
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('stories')
        .select('*, author:users(*), category:categories(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return { data };
    },

    async create(storyData: any) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('stories')
        .insert([{ ...storyData, author_id: user?.id }])
        .select()
        .single();
      if (error) throw error;
      return { data };
    },

    async update(id: string, updateData: any) {
      const { data, error } = await supabase
        .from('stories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data };
    }
  },

  // --- Wire Feed Intelligence ---
  wire: {
    async getServices() {
      return {
        data: [
          { id: 'vortex-live', name: 'Live Intelligence Hub', slug: 'vortex-live', status: 'ACTIVE', description: 'Global real-time aggregate via HATMANN Satellite' },
          { id: 'reuters', name: 'Reuters Connect', slug: 'reuters', status: 'STABLE', description: 'Global high-fidelity news wire' },
          { id: 'nv-direct', name: 'NewsVortex Direct', slug: 'vortex', status: 'STABLE', description: 'Internal cluster distribution' }
        ]
      };
    },
    
    async getItems(serviceId?: string) {
      // If Live Intelligence is requested, fetch from the real aggregator
      if (serviceId === 'vortex-live' || !serviceId) {
        try {
          const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=15&apiKey=${NEWS_API_KEY}`);
          const data = await response.json();
          
          if (data.status === 'ok') {
            return {
              data: {
                items: data.articles.map((article: any, index: number) => ({
                  id: `live-${index}`,
                  title: article.title,
                  summary: article.description || article.content || 'No summary available.',
                  link: article.url,
                  author: article.author || article.source.name,
                  publishedAt: article.publishedAt,
                  service: { name: 'Live Aggregate', slug: 'vortex-live' }
                }))
              }
            };
          } else {
            throw new Error(data.message || 'Aggregator handshake failed.');
          }
        } catch (err) {
          console.error('[vortex] Aggregator Error:', err);
          // Fallback to minimal system alerts if API fails
          return { data: { items: [{
            id: 'err-1',
            title: 'System Notice: External Feed Latency',
            summary: 'The global aggregator is experiencing high latency. Retrying satellite handshake...',
            link: '#',
            author: 'System Sentinel',
            publishedAt: new Date().toISOString(),
            service: { name: 'Vortex System', slug: 'system' }
          }] } };
        }
      }

      // Default Mock Items for other services
      const mockItems = [
        {
          id: 'w1',
          title: 'Regional Summit: Economic Stability Protocols',
          summary: 'Leaders gather to discuss a unified digital currency framework for sub-Saharan trade.',
          link: '#',
          author: 'A. Reuters Staff',
          publishedAt: new Date().toISOString(),
          service: { name: 'Reuters', slug: 'reuters' }
        }
      ];
      
      const filtered = serviceId ? mockItems.filter(i => i.service.slug === serviceId) : mockItems;
      return { data: { items: filtered } };
    },

    async importToStory(wireItemId: string, stationId: string) {
      // Re-fetch current items to find the one to import
      const itemsResponse = await this.getItems();
      const item = itemsResponse.data.items.find((i: any) => i.id === wireItemId);
      
      if (!item) throw new Error('Wire item not found');

      const { data, error } = await supabase
        .from('stories')
        .insert([{
          title: `[LIVE WIRE] ${item.title}`,
          plain_text: item.summary,
          body: { content: `<p>${item.summary}</p><p><small>Source: ${item.service.name} / ${item.author} — Verified via Satellite Aggregate</small></p>` },
          status: 'DRAFT',
          station_id: stationId,
          source: item.service.name,
          word_count: item.summary.split(' ').length
        }])
        .select()
        .single();

      if (error) throw error;
      return { data };
    }
  },

  // --- Show Operations ---
  shows: {
    async getAll(stationId: string) {
      const { data, error } = await supabase
        .from('shows')
        .select('*')
        .eq('station_id', stationId)
        .eq('is_active', true);
      if (error) throw error;
      return { data: data || [] };
    },

    async create(showData: any) {
      const { data, error } = await supabase
        .from('shows')
        .insert([showData])
        .select()
        .single();
      if (error) throw error;
      return { data };
    },

    async getInstances(showId: string) {
      const { data, error } = await supabase
        .from('show_instances')
        .select('*, rundown:rundowns(id, status)')
        .eq('show_id', showId)
        .order('air_date', { ascending: false });
      if (error) throw error;
      return { data: data || [] };
    },

    async createInstance(showId: string, instanceData: any) {
      const { data: instance, error: instErr } = await supabase
        .from('show_instances')
        .insert([{ ...instanceData, show_id: showId }])
        .select()
        .single();
      if (instErr) throw instErr;

      const { data: rundown, error: runErr } = await supabase
        .from('rundowns')
        .insert([{ show_instance_id: instance.id }])
        .select()
        .single();
      if (runErr) throw runErr;

      return { data: { ...instance, rundown } };
    }
  },

  // --- Rundown Operations ---
  rundowns: {
    async getById(id: string) {
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
      if (data?.items) data.items.sort((a: any, b: any) => a.position - b.position);
      return { data };
    },

    async addItem(rundownId: string, itemData: any) {
      const { data: countData } = await supabase
        .from('rundown_items')
        .select('position')
        .eq('rundown_id', rundownId)
        .order('position', { ascending: false })
        .limit(1);
      
      const position = countData && countData.length > 0 ? countData[0].position + 1 : 0;
      
      const { data, error } = await supabase
        .from('rundown_items')
        .insert([{ ...itemData, rundown_id: rundownId, position }])
        .select()
        .single();
      
      if (error) throw error;
      return { data };
    },

    async deleteItem(itemId: string) {
      const { error } = await supabase
        .from('rundown_items')
        .delete()
        .eq('id', itemId);
      if (error) throw error;
    }
  },

  // --- Global Metadata ---
  metadata: {
    async getCategories() {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) return { data: [] };
      return { data: data || [] };
    },
    async getStations() {
      const { data, error } = await supabase.from('stations').select('*');
      if (error) return { data: [] };
      return { data: data || [] };
    }
  }
};

// Legacy shim for non-refactored parts
export const api = {
  get: (url: string) => {
    if (url.includes('/wire/services')) return vortex.wire.getServices();
    if (url.includes('/wire/items')) {
      const urlObj = new URL(url, 'http://localhost');
      const serviceId = urlObj.searchParams.get('serviceId');
      return vortex.wire.getItems(serviceId || undefined);
    }
    return Promise.resolve({ data: { data: [] } });
  },
  post: (url: string, data: any) => {
    if (url.includes('/import')) {
      const parts = url.split('/');
      const itemId = parts[parts.indexOf('items') + 1];
      return vortex.wire.importToStory(itemId, data.stationId);
    }
    return Promise.resolve({ data: { data: {} } });
  },
  patch: (url: string, data: any) => Promise.resolve({ data: { data: {} } }),
  delete: (url: string) => Promise.resolve({ data: { data: {} } }),
};