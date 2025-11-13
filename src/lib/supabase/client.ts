import { createClient } from '@supabase/supabase-js';
import { env } from '@/utils/env';

// Initialize the Supabase client with the URL and anon key from environment variables
export const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Export auth functions for convenience
export const { auth } = supabase;
