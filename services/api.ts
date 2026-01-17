import supabase from './supabase';

/**
 * NewsVortex Supabase Service Wrapper
 * Direct serverless database interaction for Stories, Shows, and Rundowns.
 */

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
    if (url.includes('/wire/services')) return Promise.resolve({ data: { data: [] } });
    if (url.includes('/wire/items')) return Promise.resolve({ data: { data: { items: [] } } });
    return Promise.resolve({ data: { data: [] } });
  },
  post: (url: string, data: any) => Promise.resolve({ data: { data: {} } }),
  patch: (url: string, data: any) => Promise.resolve({ data: { data: {} } }),
  delete: (url: string) => Promise.resolve({ data: { data: {} } }),
};