import { createClient } from '@supabase/supabase-js';

// Accessing environment variables via Vite's import.meta.env
// These should be configured in the Vercel project settings
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[NewsVortex] Supabase configuration missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY are set in your environment.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;