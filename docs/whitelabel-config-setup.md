# Whitelabel Configuration Setup

## Overview

The Whitelabel Configuration system allows administrators to customize the application's branding, messages, forms, and system settings through a user-friendly form interface instead of editing raw JSON files.

## Components

### 1. Frontend Form Component
- **Location**: `src/components/admin/WhitelabelConfigForm.tsx`
- **Features**: 
  - Tabbed interface for different configuration sections
  - Form-based editing (no raw JSON)
  - Real-time validation
  - Color pickers for branding colors
  - Toggle switches for boolean settings
  - Number inputs for performance settings

### 2. Backend Service
- **Location**: `src/services/whitelabelService.ts`
- **Features**:
  - Type-safe API calls
  - Authentication handling
  - Error handling and user feedback

### 3. Supabase Edge Function
- **Location**: `supabase/functions/whitelabel-config/index.ts`
- **Features**:
  - Admin-only access control
  - Config file storage in Supabase Storage
  - Default config fallback
  - Input validation

## Setup Instructions

### 1. Create Storage Bucket

You need to create a storage bucket named `config` in your Supabase project:

1. Go to your Supabase Dashboard
2. Navigate to Storage
3. Create a new bucket named `config`
4. Set the bucket to private
5. Create a storage policy to allow admin users to read/write:

```sql
-- Allow admins to read config files
CREATE POLICY "Allow admins to read config" ON storage.objects
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Allow admins to insert/update config files
CREATE POLICY "Allow admins to insert config" ON storage.objects
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Allow admins to update config files
CREATE POLICY "Allow admins to update config" ON storage.objects
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
```

### 2. Deploy the Edge Function

```bash
# From the project root
supabase functions deploy whitelabel-config
```

### 3. Access the Configuration

1. Log in as an admin user
2. Navigate to Admin Panel → Whitelabel Config
3. Use the form interface to modify settings
4. Click "Save Changes" to update the configuration

## Configuration Sections

### App Settings
- App name
- Welcome points
- Tagline and subtitle
- Description

### Branding
- College name
- Portal name
- Color scheme (primary, secondary, accent)
- Logo URLs
- Favicon

### Forms
- Form labels
- Placeholders
- Shift and role options

### Messages
- Authentication messages
- Error messages
- Loading messages
- Success messages

### System
- Performance settings
- Security settings
- ISO compliance settings

### Badges
- Badge image URLs

## Security

- Only users with `admin` role can access the configuration
- All API calls require valid authentication
- Configuration is stored securely in Supabase Storage
- Input validation prevents malicious data

## Troubleshooting

### Common Issues

1. **"Admin access required" error**
   - Ensure the user has `admin` role in the database
   - Check that the user is properly authenticated

2. **"Failed to fetch config" error**
   - Verify the storage bucket `config` exists
   - Check storage policies are correctly set
   - Ensure the Edge Function is deployed

3. **"Failed to save config" error**
   - Check storage bucket permissions
   - Verify the user has write access to the bucket

### Debug Steps

1. Check browser console for detailed error messages
2. Verify Supabase project URL and keys
3. Test Edge Function directly via Supabase Dashboard
4. Check storage bucket contents and policies

## API Endpoints

- `GET /functions/v1/whitelabel-config` - Fetch current configuration
- `POST /functions/v1/whitelabel-config` - Update configuration

Both endpoints require admin authentication and return JSON responses. 