import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to make authenticated API calls to Supabase functions
 */
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  // If endpoint starts with /functions/v1/, use Supabase client for function calls
  if (endpoint.startsWith('/functions/v1/')) {
    const functionName = endpoint.replace('/functions/v1/', '');

    // Parse the request body if it exists
    let body = undefined;
    if (options.body && typeof options.body === 'string') {
      try {
        body = JSON.parse(options.body);
      } catch (e) {
        body = options.body;
      }
    }

    // Use Supabase client to invoke the function
    const { data: functionData, error } = await supabase.functions.invoke(functionName, {
      body,
    });

    // Create a Response-like object to maintain compatibility
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(functionData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // For non-function endpoints, use regular fetch
  const { data: { session } } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if we have a session
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  // Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
