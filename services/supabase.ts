import { createClient } from '@supabase/supabase-js';

// Detect environment variables across different possible bundler implementations
const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) return import.meta.env[key];
  return null;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://vpavvvcpjnjwpdpibybh.supabase.co';
const supabaseKey = getEnv('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY') || 'sb_publishable_wb8k9G_4vHtNSMZ5syCgaQ_c7s3WK4S';

if (!supabaseUrl || !supabaseKey) {
  console.warn('[NewsVortex] Supabase credentials not found in environment. Using fallback defaults.');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'newsvortex-auth-token'
  }
});

export default supabase;