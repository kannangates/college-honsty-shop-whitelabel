// Unified Whitelabel / Branding configuration
// This replaces the old src/config/* folder which duplicated data already
// present in branding/<brand>.json. The active brand is determined at build
// time via the Vite env variable `VITE_BRAND`. Default is `default`.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck – JSON modules are provided by Vite and typed as `any`.

/* --------------------------------------------------------------------------
 * 1.  Load branding JSON (theme + config + messages) for the active brand
 * ----------------------------------------------------------------------- */

const ACTIVE_BRAND = import.meta.env.VITE_BRAND || 'default';

// Vite's `import.meta.glob` lets us eagerly import all JSON upfront. We then
// pick the entries that match our active brand.
import type { ThemeJSON, ConfigJSON, MessagesJSON } from './types/branding';

const themeModules = import.meta.glob('../branding/*/theme.json', { eager: true });
const configModules = import.meta.glob('../branding/*/config.json', { eager: true });
const messageModules = import.meta.glob('../branding/*/messages.json', { eager: true });

function pick<T>(modules: Record<string, { default: T }>, path: string): T {
  const mod = modules[path];
  if (!mod) {
    throw new Error(`Branding file not found: ${path}`);
  }
  return mod.default;
}

const theme = pick<ThemeJSON>(themeModules, `../branding/${ACTIVE_BRAND}/theme.json`);
const config = pick<ConfigJSON>(configModules, `../branding/${ACTIVE_BRAND}/config.json`);
const messages = pick<MessagesJSON>(messageModules, `../branding/${ACTIVE_BRAND}/messages.json`);

/* --------------------------------------------------------------------------
 * 2.  Static (non-brand-specific) configuration                                      
 * ----------------------------------------------------------------------- */

export const SUPABASE_CONFIG = {
  PROJECT_ID: 'vkuagjkrpbagrchsqmsf',
  URL: 'https://vkuagjkrpbagrchsqmsf.supabase.co',
  ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrdWFnamtycGJhZ3JjaHNxbXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjEyMjAsImV4cCI6MjA2NDA5NzIyMH0.c8Zh7OLqeHVFObhiTnmCU7ZkyP2G-5iHY9m3E2KNObs',
  AUTH_CONFIG: {
    site_url: 'http://localhost:3000',
    additional_redirect_urls: ['https://lovable.dev'],
    jwt_expiry: 3600,
    enable_signup: true,
    double_confirm_changes: true,
    enable_confirmations: false,
  },
} as const;

/* --------------------------------------------------------------------------
 * 3.  Helper accessors – keep the same API used throughout the codebase
 * ----------------------------------------------------------------------- */

export const getCurrentTheme = (): ThemeJSON => theme;
export const getCurrentConfig = (): ConfigJSON => config;
export const getCurrentMessages = (): MessagesJSON => messages;

export const getBrandingConfig = async () => ({ theme, config, messages });

/* --------------------------------------------------------------------------
 * 4.  Higher-level CONFIG object (largely mirrors the previous src/config/index.ts)
 * ----------------------------------------------------------------------- */

export const CONFIG = {
  APP: {
    NAME: config.app.name,
    TAGLINE: theme.tagline,
    SUBTITLE: theme.subtitle,
    DESCRIPTION: theme.description,
  },
  BRANDING: {
    COLLEGE_NAME: theme.name,
    PORTAL_NAME: theme.portal_name,
    COLORS: theme.colors,
  },
  SUPABASE: SUPABASE_CONFIG,
  IMAGES: {
    COLLEGE_LOGO: theme.logo.url,
    COLLEGE_LOGO_FALLBACK: theme.logo.fallback,
    FAVICON: theme.favicon,
    BADGE_IMAGES: {
      ACHIEVEMENT_BADGE: 'https://cdn.jsdelivr.net/gh/twbs/icons@1.10.5/icons/award.svg',
      HONOR_BADGE: 'https://cdn.jsdelivr.net/gh/twbs/icons@1.10.5/icons/trophy.svg',
      EXCELLENCE_BADGE: 'https://cdn.jsdelivr.net/gh/twbs/icons@1.10.5/icons/star.svg',
    },
  },
  FORMS: {
    ...config.forms,
  },
  MESSAGES: messages,
  SYSTEM: {
    DEFAULT_POINTS: config.app.welcome_points,
    PERFORMANCE: config.system.performance,
    SECURITY: config.system.security,
    ISO_COMPLIANCE: config.system.iso_compliance,
  },
  ADMIN: {
    ACCESS_NOTE: 'Super Admin Access: Check with Radhika',
  },
} as const;

// Direct export for legacy imports expecting SYSTEM_CONFIG
export const SYSTEM_CONFIG = CONFIG.SYSTEM;

/* --------------------------------------------------------------------------
 * 5.  Back-compat flattened export (WHITELABEL_CONFIG)                       
 * ----------------------------------------------------------------------- */

export const WHITELABEL_CONFIG = {
  // App Identity
  get APP_NAME() {
    return CONFIG.APP.NAME;
  },
  get APP_TAGLINE() {
    return CONFIG.APP.TAGLINE;
  },
  get APP_SUBTITLE() {
    return CONFIG.APP.SUBTITLE;
  },
  get APP_DESCRIPTION() {
    return CONFIG.APP.DESCRIPTION;
  },

  // Branding
  get BRANDING() {
    return CONFIG.BRANDING;
  },
  get COLLEGE_NAME() {
    return CONFIG.BRANDING.COLLEGE_NAME;
  },
  get PORTAL_NAME() {
    return CONFIG.BRANDING.PORTAL_NAME;
  },
  get COLORS() {
    return CONFIG.BRANDING.COLORS;
  },

  // Images
  get IMAGES() {
    return CONFIG.IMAGES;
  },
  get LOGO_URL() {
    return CONFIG.IMAGES.COLLEGE_LOGO;
  },
  get FAVICON_URL() {
    return CONFIG.IMAGES.FAVICON;
  },
  get COLLEGE_LOGO_FALLBACK() {
    return CONFIG.IMAGES.COLLEGE_LOGO_FALLBACK;
  },
  get BADGE_IMAGES() {
    return CONFIG.IMAGES.BADGE_IMAGES;
  },

  // Forms
  get FORM_LABELS() {
    return CONFIG.FORMS.labels;
  },
  get FORM_PLACEHOLDERS() {
    return CONFIG.FORMS.placeholders;
  },

  // Messages
  get AUTH_MESSAGES() {
    return CONFIG.MESSAGES.auth;
  },
  get NAVIGATION_MESSAGES() {
    return CONFIG.MESSAGES.navigation;
  },
  get PRODUCT_MESSAGES() {
    return CONFIG.MESSAGES.products;
  },
  get ERROR_MESSAGES() {
    return CONFIG.MESSAGES.errors;
  },
  get LOADING_STATES() {
    return CONFIG.MESSAGES.loading;
  },
  get SUCCESS_MESSAGES() {
    return CONFIG.MESSAGES.success;
  },

  // System
  get SYSTEM_CONFIG() {
    return CONFIG.SYSTEM;
  },
  get DEFAULT_POINTS() {
    return CONFIG.SYSTEM.DEFAULT_POINTS;
  },
  get PERFORMANCE() {
    return CONFIG.SYSTEM.PERFORMANCE;
  },
  get SECURITY() {
    return CONFIG.SYSTEM.SECURITY;
  },

  // Admin
  get ADMIN_CONFIG() {
    return CONFIG.ADMIN;
  },
} as const;

/* --------------------------------------------------------------------------
 * 6.  Convenience helpers                                                    
 * ----------------------------------------------------------------------- */

export const getLogoUrl = (): string => CONFIG.IMAGES.COLLEGE_LOGO;

export const generateThemeCSS = (): string => {
  return `:root {\n  --brand-primary: ${theme.colors.primary};\n  --brand-secondary: ${theme.colors.secondary};\n  --brand-accent: ${theme.colors.accent};\n}`;
};
