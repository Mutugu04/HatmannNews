import { createClient } from '@supabase/supabase-js';

// Environment variables are prioritized, with hardcoded values as emergency fallbacks
const supabaseUrl = (typeof process !== 'undefined' && process.env.VITE_SUPABASE_URL) || 'https://vpavvvcpjnjwpdpibybh.supabase.co';
const supabaseKey = (typeof process !== 'undefined' && process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY) || 'sb_publishable_wb8k9G_4vHtNSMZ5syCgaQ_c7s3WK4S';

if (!supabaseUrl || !supabaseKey) {
  console.error('[NewsVortex] Supabase credentials missing. Check your environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;