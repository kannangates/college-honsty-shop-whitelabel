# Express Server for MFA API Routes

This Express server handles MFA (Multi-Factor Authentication) API routes for the
Vite React application.

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

### POST /api/mfa/setup

Generate MFA secret and QR code for a user.

**Response:**

```json
{
  "secret": "BASE32_SECRET",
  "qrCode": "data:image/png;base64,...",
  "otpauthUrl": "otpauth://totp/..."
}
```

### POST /api/mfa/verify

Verify MFA token and enable MFA for the user.

**Request:**

```json
{
  "token": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "MFA enabled successfully"
}
```

### POST /api/mfa/verify-session

Verify MFA token during login.

**Request:**

```json
{
  "token": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "MFA verified successfully"
}
```

### POST /api/mfa/disable

Disable MFA for the authenticated user.

**Response:**

```json
{
  "success": true,
  "message": "MFA disabled successfully"
}
```

### GET /api/mfa/status

Check if MFA is enabled for the authenticated user.

**Response:**

```json
{
  "enabled": true
}
```

## Architecture

- `server/index.js` - Main Express server with Vite middleware
- `server/routes/mfa.js` - MFA API route handlers
- `server/lib/supabase.js` - Supabase admin client and auth helpers
- `server/lib/mfa-utils.js` - MFA utility functions (speakeasy, QR code
  generation)
