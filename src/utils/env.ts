// Client-side environment variables utility
// In production, these will be injected by the hosting platform
// In development, they'll be loaded from .env.local

interface EnvVars {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  [key: string]: string | undefined;
}

// Extend the Window interface to include __ENV
declare global {
  interface Window {
    __ENV?: Record<string, string>;
  }
}

// This will be populated at runtime
let envVars: EnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
};

// In the browser, we'll use window.__ENV if available (injected by the hosting platform)
// Otherwise, we'll use process.env (for development)
if (typeof window !== 'undefined') {
  // In the browser
  const windowEnv = (window as unknown as { __ENV?: Record<string, string> }).__ENV;
  
  if (windowEnv) {
    // In production, use the injected environment variables
    envVars = { ...envVars, ...windowEnv };
  } else if (process.env.NODE_ENV === 'development') {
    // In development, use process.env
    envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    };
  }
} else {
  // On the server, always use process.env
  envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
}

// Export the environment variables
export const env = envVars;

// Helper function to get an environment variable
export function getEnvVar(key: string, defaultValue: string = ''): string {
  return envVars[key] || defaultValue;
}
// For backward compatibility
export default env;
