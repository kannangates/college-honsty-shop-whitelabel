// Frontend configuration with hardcoded public values
export const CONFIG = {
  // Supabase configuration (public values safe for frontend)
  SUPABASE_URL: "https://vkuagjkrpbagrchsqmsf.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdWFnamtycGJhZ3JjaHNxbXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjEyMjAsImV4cCI6MjA2NDA5NzIyMH0.c8Zh7OLqeHVFObhiTnmCU7ZkyP2G-5iHY9m3E2KNObs",
  SUPABASE_FUNCTIONS_URL: "https://vkuagjkrpbagrchsqmsf.functions.supabase.co",
  
  // hCaptcha site key (public value safe for frontend) 
  // TODO: Replace with your actual hCaptcha site key from the Supabase dashboard
  HCAPTCHA_SITE_KEY: "d3c6a1ba-a136-45fc-b890-b9a8a5449e2a",
  
  // Email domain for student accounts
  EMAIL_DOMAIN: "shasuncollege.edu.in"
} as const;

// Helper function to check if all required secrets are configured
export const validateSecrets = () => {
  const requiredSecrets = [
    'HCAPTCHA_SITE_KEY'
  ] as const;
  
  const missing = requiredSecrets.filter(key => !CONFIG[key] || CONFIG[key] === "d3c6a1ba-a136-45fc-b890-b9a8a5449e2a");
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
};