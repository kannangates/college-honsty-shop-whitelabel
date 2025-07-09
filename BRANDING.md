# Branding Configuration

This document explains how to customize the branding for your college's instance of the portal.

## Overview

The portal uses a centralized branding system that can be easily customized to match your college's identity. All branding-related configurations are stored in `src/config/branding.ts`.

## Quick Setup

1. **Run the setup script**:
   ```bash
   node scripts/setup-branding.js
   ```
   This will guide you through setting up your college's branding interactively.

2. **Add your logo**:
   - Place your college logo (preferably 200x50px) at `public/images/logo.png`
   - Update the favicon at `public/favicon.ico`

3. **Restart the development server** to see your changes.

## Manual Configuration

If you prefer to configure branding manually, edit `src/config/branding.ts` directly. The configuration includes:

```typescript
{
  // College information
  college: {
    name: 'Shasun College',
    shortName: 'Shasun',
    location: 'Chennai, India',
    website: 'https://shasuncbe.edu.in',
    email: 'info@shasuncbe.edu.in',
    phone: '+91 44 2442 4200',
    address: '864, Poonamallee High Road, Kilpauk, Chennai - 600010',
    logo: '/images/college-logo.png',
    favicon: '/favicon.ico',
  },
  
  // Portal information
  portal: {
    name: 'Campus Connect',
    description: 'Shasun College Student Portal',
    version: '1.0.0',
    themeColor: '#1976d2',
  },
  
  // Theme colors and typography
  theme: {
    colors: {
      primary: '#1976d2',
      secondary: '#9c27b0',
      accent: '#ff4081',
      // ... other theme colors
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
  },
  
  // Feature flags
  features: {
    darkMode: true,
    notifications: true,
    // ... other features
  },
  
  // Social media links
  social: {
    facebook: 'https://facebook.com/shasuncollege',
    twitter: 'https://twitter.com/shasuncollege',
    // ... other social links
  }
}
```

## Theme Customization

### Colors

Update the `theme.colors` object to match your college's color scheme:

```typescript
theme: {
  colors: {
    primary: '#1976d2',      // Main brand color (buttons, links, etc.)
    secondary: '#9c27b0',   // Secondary brand color
    accent: '#ff4081',      // Accent color for highlights
    success: '#4caf50',     // Success messages
    warning: '#ff9800',     // Warning messages
    error: '#f44336',       // Error messages
    info: '#2196f3',        // Informational messages
  }
}
```

### Typography

Customize fonts and text styles:

```typescript
theme: {
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    // You can add more typography settings here
  }
}
```

## Assets

### Logo
- Recommended size: 200x50px
- Format: PNG with transparent background
- Location: `public/images/logo.png`

### Favicon
- Recommended size: 32x32px or 64x64px
- Format: ICO
- Location: `public/favicon.ico`

## Feature Flags

Enable or disable features using the `features` object:

```typescript
features: {
  darkMode: true,        // Enable dark mode
  notifications: true,   // Enable notifications
  announcements: true,   // Show announcements section
  events: true,          // Show events calendar
  attendance: true,      // Show attendance tracking
  assignments: true,     // Show assignments
  results: true,         // Show exam results
  library: true,         // Show library section
  hostel: true,          // Show hostel information
  transport: true,       // Show transport information
  fees: true,            // Show fee information
  alumni: true,          // Show alumni section
}
```

## Social Media

Add your college's social media links:

```typescript
social: {
  facebook: 'https://facebook.com/yourcollege',
  twitter: 'https://twitter.com/yourcollege',
  instagram: 'https://instagram.com/yourcollege',
  linkedin: 'https://linkedin.com/school/yourcollege',
  youtube: 'https://youtube.com/yourcollege',
}
```

## Best Practices

1. **Test your changes** in both light and dark modes
2. **Use web-safe fonts** or include the font files in your project
3. **Optimize images** for web to improve load times
4. **Keep a backup** of your branding configuration
5. **Document any customizations** for future reference

## Troubleshooting

- If you don't see your changes, try clearing your browser cache
- Check the browser console for any errors
- Make sure the server is restarted after making changes to the config file
- Verify file paths and permissions for uploaded assets

## Support

For assistance with branding customization, please contact the development team or refer to the project documentation.
