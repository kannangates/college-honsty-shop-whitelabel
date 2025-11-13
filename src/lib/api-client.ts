import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to make authenticated API calls to the Express backend
 */
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  // Get the current session token
  const { data: { session } } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if we have a session
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  return response;
}
