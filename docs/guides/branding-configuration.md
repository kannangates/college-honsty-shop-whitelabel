# Branding & Configuration Guide

This guide explains how to customize the look and feel of your White-Label College Honesty Shop instance and manage configuration settings.

## Table of Contents
- [Branding Customization](#-branding-customization)
  - [Theme Configuration](#theme-configuration)
  - [Logo & Assets](#logo--assets)
  - [Favicon](#favicon)
  - [Custom CSS](#custom-css)
- [Configuration Management](#-configuration-management)
  - [Environment Variables](#environment-variables)
  - [Feature Flags](#feature-flags)
  - [API Keys & Secrets](#api-keys--secrets)
  - [College-Specific Settings](#college-specific-settings)
- [Advanced Customization](#-advanced-customization)
  - [Custom Components](#custom-components)
  - [Theming System](#theming-system)
  - [Localization](#localization)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)

## 🎨 Branding Customization

### Theme Configuration

1. **Primary Configuration File**
   Location: `src/config/theme.ts`
   ```typescript
   export const defaultTheme = {
     colors: {
       primary: '#202072',
       secondary: '#e66166',
       accent: '#f3f4f6',
       background: '#ffffff',
       text: '#1f2937',
       // ... other theme colors
     },
     fonts: {
       primary: 'Inter, sans-serif',
       // ... other font settings
     },
     // ... other theme properties
   };
   ```

2. **College-Specific Themes**
   Location: `src/branding/colleges/`
   ```typescript
   // Example: src/branding/colleges/engineering.ts
   export const engineeringTheme = {
     colors: {
       primary: '#1e40af',
       secondary: '#1e40af',
       // Override specific theme values
     },
     // Only include properties you want to override
   };
   ```

### Logo & Assets

1. **Logo Replacement**
   - Place your logo files in `public/logo/`
   - Supported formats: SVG (recommended), PNG, JPG
   - Required sizes:
     - `logo.svg` (main logo, vector preferred)
     - `logo-icon.svg` (square icon, 512x512px)
     - `logo-dark.svg` (for dark mode)

2. **Favicon**
   - Replace files in `public/favicon/`
   - Use [Favicon Generator](https://realfavicongenerator.net/) to generate all required sizes
   - Update `src/pages/_document.tsx` if using custom favicon paths

3. **Custom CSS**
   Location: `src/styles/custom.css`
   ```css
   :root {
     /* Override CSS variables */
     --color-primary: #202072;
     --color-secondary: #e66166;
     /* Add custom styles */
   }
   
   /* Custom component styles */
   .custom-button {
     /* Your styles */
   }
   ```

## ⚙️ Configuration Management

### Environment Variables

1. **Required Variables** (`.env.local`)
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   
   # College Configuration
   NEXT_PUBLIC_COLLEGE_CODE=default
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   
   # Optional Features
   NEXT_PUBLIC_ENABLE_ANALYTICS=false
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

2. **Server-Side Variables** (`.env.local` - not prefixed with `NEXT_PUBLIC_`)
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   
   # Authentication
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   
   # Email
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=user@example.com
   SMTP_PASSWORD=your-password
   ```

### Feature Flags

Location: `src/config/features.ts`
```typescript
export const featureFlags = {
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enablePayments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
  // Add more feature flags as needed
};
```

### API Keys & Secrets

1. **Supabase**
   - Get your credentials from the Supabase dashboard
   - Update in `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     ```

2. **Third-Party Services**
   - Add API keys to `.env.local`:
     ```
     STRIPE_SECRET_KEY=your-stripe-key
     SENTRY_DSN=your-sentry-dsn
     // Other service keys
     ```

### College-Specific Settings

Location: `src/config/colleges/[college-code].ts`
```typescript
// Example: src/config/colleges/engineering.ts
export const engineeringConfig = {
  name: 'Engineering College',
  theme: 'engineering', // References theme in src/branding/
  features: {
    enableLabEquipmentCheckout: true,
    // College-specific features
  },
  // Other college-specific settings
};
```

## 🛠 Advanced Customization

### Custom Components

1. **Override Default Components**
   Location: `src/components/custom/`
   ```typescript
   // Example: src/components/custom/Header.tsx
   import { Header as DefaultHeader } from '@/components/common/Header';
   
   export function Header() {
     return (
       <div className="custom-header">
         <DefaultHeader />
         {/* Your customizations */}
       </div>
     );
   }
   ```

2. **Custom Pages**
   - Add pages to `src/pages/`
   - Use `getStaticProps` for static generation
   - Implement API routes in `src/pages/api/`

### Theming System

1. **Theme Provider**
   ```typescript
   // src/providers/ThemeProvider.tsx
   import { useTheme } from 'next-themes';
   
   export function ThemeProvider({ children }) {
     const { theme, setTheme } = useTheme();
     // Your theme logic here
     
     return (
       <div data-theme={theme}>
         {children}
       </div>
     );
   }
   ```

2. **Using Themes in Components**
   ```typescript
   import { useTheme } from 'next-themes';
   
   function MyComponent() {
     const { theme } = useTheme();
     // Use theme values
   }
   ```

### Localization

1. **Translation Files**
   Location: `src/locales/`
   ```
   locales/
   ├── en/
   │   ├── common.json
   │   └── dashboard.json
   └── es/
       ├── common.json
       └── dashboard.json
   ```

2. **Using Translations**
   ```typescript
   import { useTranslation } from 'next-i18next';
   
   function MyComponent() {
     const { t } = useTranslation('common');
     return <h1>{t('welcome')}</h1>;
   }
   ```

## 🏆 Best Practices

1. **Version Control**
   - Never commit `.env` files
   - Use `.env.example` for required variables
   - Document all configuration options

2. **Security**
   - Rotate API keys regularly
   - Use environment variables for all secrets
   - Implement proper CORS policies

3. **Performance**
   - Optimize images and assets
   - Use code splitting
   - Implement caching strategies

## 🐛 Troubleshooting

### Common Issues

#### Theme Not Updating
- Clear browser cache
- Check for CSS specificity issues
- Verify theme is properly imported and applied

#### Environment Variables Not Loading
- Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side use
- Restart development server after changing `.env` files
- Check for typos in variable names

#### Custom Components Not Rendering
- Verify component is in the correct directory
- Check for naming conflicts
- Ensure proper exports/imports

#### Localization Issues
- Check if translation files exist for the current language
- Verify translation keys match exactly
- Clear next.js cache if translations were updated

---

**Last Updated**: July 9, 2025  
**Version**: 1.0.0
