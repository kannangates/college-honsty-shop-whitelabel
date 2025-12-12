# Express Server for API Routes

This Express server handles API routes for the Vite React application.
Note: MFA functionality has been moved to Supabase Edge Functions.

## Setup

1. Install dependencies (already done in root package.json)
2. Set up environment variables in `.env` file:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin
     operations)

## Running the Server

### Development

```bash
npm run dev
```

This will start both the Express server and Vite dev server together.

### Production

```bash
npm run build
npm start
```

## API Endpoints

All endpoints require authentication via Bearer token in the Authorization
header.

## MFA Functionality

MFA (Multi-Factor Authentication) functionality has been moved to Supabase Edge Functions:
- `supabase/functions/mfa-setup/` - Generate MFA secrets and QR codes
- `supabase/functions/mfa-verify/` - Verify MFA tokens and enable MFA
- `supabase/functions/mfa-status/` - Check MFA status
- `supabase/functions/mfa-disable/` - Disable MFA
- `supabase/functions/mfa-verify-session/` - Verify MFA for PII access

These functions are deployed to Supabase and called directly from the frontend.

## Architecture

- `server/index.js` - Main Express server with Vite middleware
- `server/lib/supabase.js` - Supabase admin client and auth helpers
