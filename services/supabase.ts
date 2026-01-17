import { createClient } from '@supabase/supabase-js';

// Hardcoded credentials for immediate stability as requested.
const supabaseUrl = 'https://vpavvvcpjnjwpdpibybh.supabase.co';
const supabaseKey = 'sb_publishable_wb8k9G_4vHtNSMZ5syCgaQ_c7s3WK4S';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[NewsVortex] Supabase configuration missing.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;