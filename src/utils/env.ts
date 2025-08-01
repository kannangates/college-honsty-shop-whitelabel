// Environment variables utility for Lovable deployment
// Works with both development and production environments

interface EnvVars {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  [key: string]: string | undefined;
}

// Fallback values for production deployment
const PRODUCTION_SUPABASE_URL = 'https://vkuagjkrpbagrchsqmsf.supabase.co';
const PRODUCTION_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdWFnamtycGJhZ3JjaHNxbXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjEyMjAsImV4cCI6MjA2NDA5NzIyMH0.c8Zh7OLqeHVFObhiTnmCU7ZkyP2G-5iHY9m3E2KNObs';

// Get environment variables with proper fallbacks for Lovable deployment
const getEnvVars = (): EnvVars => {
  // Try to get from import.meta.env first (Vite)
  const viteSupabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
  const viteSupabaseKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

  return {
    NEXT_PUBLIC_SUPABASE_URL: viteSupabaseUrl || PRODUCTION_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: viteSupabaseKey || PRODUCTION_SUPABASE_ANON_KEY,
  };
};

// Initialize environment variables
const envVars: EnvVars = getEnvVars();

// Export the environment variables
export const env = envVars;

// Helper function to get an environment variable
export function getEnvVar(key: string, defaultValue: string = ''): string {
  return envVars[key] || defaultValue;
}

// For backward compatibility
export default env;