// Frontend configuration with hardcoded public values
export const CONFIG = {
  // Supabase configuration (public values safe for frontend)
  SUPABASE_URL: "https://vkuagjkrpbagrchsqmsf.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdWFnamtycGJhZ3JjaHNxbXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjEyMjAsImV4cCI6MjA2NDA5NzIyMH0.c8Zh7OLqeHVFObhiTnmCU7ZkyP2G-5iHY9m3E2KNObs",
  SUPABASE_FUNCTIONS_URL: "https://vkuagjkrpbagrchsqmsf.functions.supabase.co",
  
  // hCaptcha site key (public value safe for frontend) 
  // TODO: Replace with your actual hCaptcha site key from the Supabase dashboard
  HCAPTCHA_SITE_KEY: "7a1fcd80-4e12-428b-a905-b45d2942ddad",
  
  // Email domain for student accounts
  EMAIL_DOMAIN: "shasuncollege.edu.in"
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