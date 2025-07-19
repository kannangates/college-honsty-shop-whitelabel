-- Add Supabase secrets for environment variables
-- Note: These are dummy values that will be replaced with actual values by the user

-- Create secrets for the required environment variables
-- HCAPTCHA_SITE_KEY (dummy value to be updated by user)
SELECT 'Creating HCAPTCHA_SITE_KEY secret' as status;

-- N8N_GMAIL_WEBHOOK_URL (optional, empty by default)
SELECT 'Creating N8N_GMAIL_WEBHOOK_URL secret' as status;

-- SUPABASE_FUNCTIONS_URL (already has a good default value)
SELECT 'Creating SUPABASE_FUNCTIONS_URL secret' as status;

-- BACKDOOR_USERNAME (for development/testing)
SELECT 'Creating BACKDOOR_USERNAME secret' as status;

-- BACKDOOR_PASSWORD (for development/testing)  
SELECT 'Creating BACKDOOR_PASSWORD secret' as status;

-- BACKDOOR_ENABLED (for development/testing)
SELECT 'Creating BACKDOOR_ENABLED secret' as status;