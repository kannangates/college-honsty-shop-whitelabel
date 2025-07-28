import { env } from '@/utils/env';

// Frontend configuration with environment variables
export const CONFIG = {
  // Supabase configuration
  SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_FUNCTIONS_URL: env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL || '',
  
  // hCaptcha site key
  HCAPTCHA_SITE_KEY: env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '',
  
  // Email domain for student accounts
  EMAIL_DOMAIN: env.NEXT_PUBLIC_EMAIL_DOMAIN || 'example.edu.in'
} as const;

// Helper function to check if all required secrets are configured
export const validateSecrets = () => {
  const requiredSecrets = [
    'HCAPTCHA_SITE_KEY'
  ] as const;
  
  const missing = requiredSecrets.filter(key => !CONFIG[key] || CONFIG[key] === "7a1fcd80-4e12-428b-a905-b45d2942ddad");
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
};