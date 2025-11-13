# Quick Start Guide

## Your App is Now Clean! 🎉

All Next.js dependencies and references have been completely removed. Your app
now runs on a clean Vite + React + Express stack.

## What Changed?

- ❌ Removed Next.js (was causing React conflicts)
- ✅ Added Express server for API routes
- ✅ Updated all environment variables to use `VITE_` prefix
- ✅ Cleaned up duplicate files
- ✅ Fixed all import paths

## Running Your App

### Development

```bash
npm run dev
```

This starts Express server with Vite on http://localhost:8080

### Production Build

```bash
npm run build
```

### Production Server

```bash
npm start
```

## Environment Setup

Create/update your `.env` file:

```env
# Supabase
VITE_SUPABASE_URL=https://vkuagjkrpbagrchsqmsf.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional
VITE_HCAPTCHA_SITE_KEY=your_hcaptcha_key
VITE_EMAIL_DOMAIN=example.edu.in
PORT=8080
NODE_ENV=development
```

## Deploying to Lovable

1. **Update Environment Variables** in Lovable dashboard:
   - Change `NEXT_PUBLIC_*` to `VITE_*`
   - Add `SUPABASE_SERVICE_ROLE_KEY`

2. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Complete migration to Vite + Express"
   git push origin main
   ```

3. **Lovable Auto-Deploys**:
   - Detects changes
   - Runs `npm install --legacy-peer-deps`
   - Runs `npm run build`
   - Deploys your app

4. **Verify**:
   - Visit: https://shasun-honesty-shop.lovable.app
   - No more blank page!
   - Check browser console for any errors

## API Endpoints

Your Express server handles these MFA endpoints:

- `POST /api/mfa/setup` - Generate MFA secret
- `POST /api/mfa/verify` - Verify and enable MFA
- `POST /api/mfa/verify-session` - Verify during login
- `POST /api/mfa/disable` - Disable MFA
- `GET /api/mfa/status` - Check MFA status

All endpoints require authentication via Bearer token (handled automatically by
`apiCall()` helper).

## Troubleshooting

### Build Fails

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### Environment Variables Not Working

- Make sure they start with `VITE_` not `NEXT_PUBLIC_`
- Restart dev server after changing `.env`
- Check Lovable dashboard for production env vars

### Blank Page Still Appears

- Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
- Check browser console for errors
- Verify Supabase credentials are correct

## Need Help?

Check these files:

- `CLEANUP_SUMMARY.md` - Complete list of changes
- `MIGRATION_NEXTJS_TO_EXPRESS.md` - Migration details
- `DEPLOYMENT_CHECKLIST.md` - Deployment steps
- `server/README.md` - Express server documentation

## Success Indicators

✅ Build completes without errors ✅ No React version conflicts ✅ No "Cannot
read properties of undefined" errors ✅ App loads and displays content ✅
Authentication works ✅ MFA functionality works (if enabled)

Your app is ready to deploy! 🚀
