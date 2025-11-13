# Migration from Next.js to Express + Vite

## Summary of Changes

This project has been migrated from using Next.js API routes to using Express.js
with Vite for better compatibility and performance.

## What Was Changed

### 1. Removed Next.js Dependencies

- ❌ Removed `next` package
- ❌ Removed `next-themes` package
- ❌ Removed `@supabase/auth-helpers-nextjs` (deprecated)
- ❌ Removed `@vitejs/plugin-basic-ssl` (peer dependency conflict)

### 2. Added Express Dependencies

- ✅ Added `express` for API server
- ✅ Added `cors` for CORS handling
- ✅ Added `cookie-parser` for cookie management
- ✅ Added TypeScript types for Express

### 3. Created Express Server Structure

```
server/
├── index.js              # Main Express server with Vite middleware
├── package.json          # ES modules configuration
├── lib/
│   ├── supabase.js      # Supabase admin client
│   └── mfa-utils.js     # MFA utility functions
└── routes/
    └── mfa.js           # MFA API endpoints
```

### 4. Updated Client-Side Code

- Created `src/lib/api-client.ts` - Helper for authenticated API calls
- Updated `src/hooks/useMFA.ts` - Use new API client
- Updated `src/contexts/AuthProvider.tsx` - Use new API client
- Updated `src/pages/verify-mfa.tsx` - Use React Router instead of Next Router
- Updated `src/components/ui/sonner.tsx` - Removed next-themes dependency

### 5. Deleted Next.js Specific Files

The following directories can be safely deleted (not done automatically):

- `src/pages/api/` - Old Next.js API routes (replaced by Express)
- `src/lib/supabase/server.ts` - Old Next.js server utilities

## API Endpoints

All MFA endpoints are now handled by Express:

- `POST /api/mfa/setup` - Generate MFA secret and QR code
- `POST /api/mfa/verify` - Verify MFA token and enable MFA
- `POST /api/mfa/verify-session` - Verify MFA during login
- `POST /api/mfa/disable` - Disable MFA
- `GET /api/mfa/status` - Check MFA status

## Running the Application

### Development

```bash
npm run dev
```

This starts the Express server with Vite middleware on port 8080.

### Production

```bash
npm run build
npm start
```

## Environment Variables Required

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=8080
NODE_ENV=development
```

## Authentication Flow

The Express server now handles authentication by:

1. Extracting the Bearer token from the `Authorization` header
2. Validating the token with Supabase
3. Attaching the user to the request object
4. Processing the API request with the authenticated user

Client-side code automatically includes the auth token using the `apiCall()`
helper function.

## Benefits of This Migration

1. **No More Conflicts** - Removed Next.js React conflicts
2. **Better Performance** - Vite's fast HMR in development
3. **Simpler Architecture** - Single server for both API and static files
4. **Modern Stack** - Express + Vite is a proven combination
5. **Easier Deployment** - Standard Node.js deployment

## Deployment to Lovable

After pushing these changes to your repository:

1. Lovable will automatically detect the changes
2. It will run `npm install` to update dependencies
3. It will run `npm run build` to create the production build
4. Your site should now work without the blank page issue

## Testing Locally

1. Install dependencies: `npm install --legacy-peer-deps`
2. Set up your `.env` file with Supabase credentials
3. Run: `npm run dev`
4. Open: `http://localhost:8080`

The blank page issue should now be resolved!
