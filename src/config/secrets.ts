// Configuration file that uses environment variables from Supabase secrets
export const CONFIG = {
  // Supabase configuration
  SUPABASE_URL: process.env.SUPABASE_URL || "https://vkuagjkrpbagrchsqmsf.supabase.co",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdWFnamtycGJhZ3JjaHNxbXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjEyMjAsImV4cCI6MjA2NDA5NzIyMH0.c8Zh7OLqeHVFObhiTnmCU7ZkyP2G-5iHY9m3E2KNObs",
  
  // hCaptcha configuration  
  HCAPTCHA_SITE_KEY: process.env.HCAPTCHA_SITE_KEY || "dummy-site-key",
  
  // Integration URLs
  N8N_GMAIL_WEBHOOK_URL: process.env.N8N_GMAIL_WEBHOOK_URL || "",
  SUPABASE_FUNCTIONS_URL: process.env.SUPABASE_FUNCTIONS_URL || "https://vkuagjkrpbagrchsqmsf.functions.supabase.co",
  
  // Gmail configuration for email sending
  GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID || "",
  GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET || "",
  GMAIL_USER: process.env.GMAIL_USER || "",
  GMAIL_API_KEY: process.env.GMAIL_API_KEY || "",
  GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN || "",
  
  // Email domain for student accounts
  EMAIL_DOMAIN: "shasuncollege.edu.in"
} as const;

// Helper function to check if all required secrets are configured
export const validateSecrets = () => {
  const requiredSecrets = [
    'HCAPTCHA_SITE_KEY'
  ] as const;
  
  const missing = requiredSecrets.filter(key => !CONFIG[key] || CONFIG[key] === "dummy-site-key");
  
  if (missing.length > 0) {
    console.warn('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
};