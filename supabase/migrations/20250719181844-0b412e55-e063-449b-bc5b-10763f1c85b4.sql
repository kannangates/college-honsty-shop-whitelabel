-- Remove unused backdoor secrets and add Gmail secrets for email functionality
-- Note: The user confirmed backdoor functionality is not used in their codebase

-- First, safely remove backdoor-related secrets if they exist
DO $$
BEGIN
    -- Remove backdoor secrets if they exist
    DELETE FROM vault.secrets WHERE name IN ('BACKDOOR_USERNAME', 'BACKDOOR_PASSWORD', 'BACKDOOR_ENABLED');
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if vault doesn't exist or secrets don't exist
    NULL;
END $$;

-- Add Gmail secrets for email functionality
-- These will be used by the send-email edge function
INSERT INTO vault.secrets (name, secret, description)
VALUES 
    ('GMAIL_CLIENT_ID', 'dummy-gmail-client-id', 'Gmail OAuth2 Client ID for sending emails')
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description;

INSERT INTO vault.secrets (name, secret, description)
VALUES 
    ('GMAIL_CLIENT_SECRET', 'dummy-gmail-client-secret', 'Gmail OAuth2 Client Secret for sending emails')
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description;

INSERT INTO vault.secrets (name, secret, description)
VALUES 
    ('GMAIL_USER', 'dummy-gmail-user@example.com', 'Gmail user email address for sending emails')
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description;

INSERT INTO vault.secrets (name, secret, description)
VALUES 
    ('GMAIL_API_KEY', 'dummy-gmail-api-key', 'Gmail API Key (if needed alongside OAuth2)')
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description;

INSERT INTO vault.secrets (name, secret, description)
VALUES 
    ('GMAIL_REFRESH_TOKEN', 'dummy-gmail-refresh-token', 'Gmail OAuth2 Refresh Token for sending emails')
ON CONFLICT (name) DO UPDATE SET 
    description = EXCLUDED.description;