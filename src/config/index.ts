
// Main Configuration - Now uses dynamic branding system
import { getBrandingConfig, getCurrentTheme, getCurrentConfig, getCurrentMessages } from './dynamic';
import { SUPABASE_CONFIG } from './supabase';

// Legacy imports for fallback
import { APP_CONFIG } from './app';
import { BRANDING_CONFIG } from './branding';
import { IMAGES_CONFIG } from './images';
import { FORMS_CONFIG } from './forms';
import { MESSAGES_CONFIG } from './messages';
import { SYSTEM_CONFIG } from './system';

// Dynamic CONFIG object that adapts to current branding
export const CONFIG = {
  get APP() {
    const theme = getCurrentTheme();
    const config = getCurrentConfig();
    return {
      NAME: config.app.name,
      TAGLINE: theme.tagline,
      SUBTITLE: theme.subtitle,
      DESCRIPTION: theme.description,
    };
  },
  get BRANDING() {
    const theme = getCurrentTheme();
    return {
      COLLEGE_NAME: theme.name,
      PORTAL_NAME: theme.portal_name,
      COLORS: theme.colors,
    };
  },
  SUPABASE: SUPABASE_CONFIG,
  get IMAGES() {
    const theme = getCurrentTheme();
    return {
      COLLEGE_LOGO: theme.logo.url,
      COLLEGE_LOGO_FALLBACK: theme.logo.fallback,
      FAVICON: theme.favicon,
      BADGE_IMAGES: {
        ACHIEVEMENT_BADGE: "https://cdn.jsdelivr.net/gh/twbs/icons@1.10.5/icons/award.svg",
        HONOR_BADGE: "https://cdn.jsdelivr.net/gh/twbs/icons@1.10.5/icons/trophy.svg",
        EXCELLENCE_BADGE: "https://cdn.jsdelivr.net/gh/twbs/icons@1.10.5/icons/star.svg",
      },
    };
  },
  get FORMS() {
    const config = getCurrentConfig();
    return {
      ...config.forms,
      LABELS: config.forms.labels,
      PLACEHOLDERS: config.forms.placeholders,
      SHIFT_OPTIONS: config.forms.shift_options,
      ROLE_OPTIONS: config.forms.role_options,
    };
  },
  get MESSAGES() {
    const messages = getCurrentMessages();
    return {
      ...messages,
      AUTH: messages.auth,
      NAVIGATION: messages.navigation,
      PRODUCTS: messages.products,
      ERRORS: messages.errors,
      LOADING: messages.loading,
      SUCCESS: messages.success,
    };
  },
  get SYSTEM() {
    const config = getCurrentConfig();
    return {
      DEFAULT_POINTS: config.app.welcome_points,
      PERFORMANCE: config.system.performance,
      SECURITY: config.system.security,
      ISO_COMPLIANCE: config.system.iso_compliance,
    };
  },
  ADMIN: {
    ACCESS_NOTE: "Super Admin Access: Check with Radhika",
  },
};

// Export utilities (enhanced with dynamic branding)
export { getBrandingConfig } from './dynamic';
export { getSupabaseConfig, loadImageWithRetry, validateConfig } from './utils';

export const getLogoUrl = (): string => getCurrentTheme().logo.url;

export const generateThemeCSS = () => {
  const theme = getCurrentTheme();
  return `
    :root {
      --brand-primary: ${theme.colors.primary};
      --brand-secondary: ${theme.colors.secondary};
      --brand-accent: ${theme.colors.accent};
    }
  `;
};

// Backward compatibility - flattened export (maintaining existing API)
export const WHITELABEL_CONFIG = {
  // App Identity - now dynamic
  get APP_NAME() { return CONFIG.APP.NAME; },
  get APP_TAGLINE() { return CONFIG.APP.TAGLINE; },
  get APP_SUBTITLE() { return CONFIG.APP.SUBTITLE; },
  get APP_DESCRIPTION() { return CONFIG.APP.DESCRIPTION; },
  
  // Branding - properly nested and dynamic
  get BRANDING() { return CONFIG.BRANDING; },
  get COLLEGE_NAME() { return CONFIG.BRANDING.COLLEGE_NAME; },
  get PORTAL_NAME() { return CONFIG.BRANDING.PORTAL_NAME; },
  get COLORS() { return CONFIG.BRANDING.COLORS; },
  
  // Images - dynamic
  get IMAGES() { return CONFIG.IMAGES; },
  get LOGO_URL() { return CONFIG.IMAGES.COLLEGE_LOGO; },
  get FAVICON_URL() { return CONFIG.IMAGES.FAVICON; },
  get COLLEGE_LOGO_FALLBACK() { return CONFIG.IMAGES.COLLEGE_LOGO_FALLBACK; },
  get BADGE_IMAGES() { return CONFIG.IMAGES.BADGE_IMAGES; },
  
  // Forms - flattened for easier access and dynamic
  get FORM_LABELS() { return CONFIG.FORMS.labels; },
  get FORM_PLACEHOLDERS() { return CONFIG.FORMS.placeholders; },
  get LABELS() { return CONFIG.FORMS.labels; },
  get PLACEHOLDERS() { return CONFIG.FORMS.placeholders; },
  get SHIFT_OPTIONS() { return CONFIG.FORMS.shift_options; },
  get ROLE_OPTIONS() { return CONFIG.FORMS.role_options; },
  
  // Messages - flattened structure and dynamic
  get AUTH_MESSAGES() { return CONFIG.MESSAGES.auth; },
  get NAVIGATION() { return CONFIG.MESSAGES.navigation; },
  get PRODUCT_MESSAGES() { return CONFIG.MESSAGES.products; },
  get ERROR_MESSAGES() { return CONFIG.MESSAGES.errors; },
  get LOADING_STATES() { return CONFIG.MESSAGES.loading; },
  get SUCCESS_MESSAGES() { return CONFIG.MESSAGES.success; },
  
  // System - dynamic
  get DEFAULT_POINTS() { return CONFIG.SYSTEM.DEFAULT_POINTS; },
  get PERFORMANCE() { return CONFIG.SYSTEM.PERFORMANCE; },
  get SECURITY() { return CONFIG.SYSTEM.SECURITY; },
  get ISO_COMPLIANCE() { return CONFIG.SYSTEM.ISO_COMPLIANCE; },
  
  // Admin - static
  ADMIN_ACCESS_NOTE: CONFIG.ADMIN.ACCESS_NOTE,
  
  // Supabase - static
  SUPABASE: CONFIG.SUPABASE,
};
