// Unified Whitelabel / Branding configuration
// This replaces the old src/config/* folder which duplicated data already
// present in branding/<brand>.json. The active brand is determined at build
// time via the Vite env variable `VITE_BRAND`. Default is `default`.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck – JSON modules are provided by Vite and typed as `any`.

import type { WhitelabelConfig } from './utils/whitelabelLoader';
import { loadWhitelabelConfig } from './utils/whitelabelLoader';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let CONFIG: any = null;

export const getWhitelabelConfig = async (): Promise<WhitelabelConfig> => {
  if (!CONFIG) {
    CONFIG = await loadWhitelabelConfig();
  }
  return CONFIG;
};

// Synchronous fallback for static imports (for test mocks, etc.)
export let STATIC_CONFIG: WhitelabelConfig | null = null;

// Helper to initialize and flatten config for legacy compatibility
export async function initializeConfig() {
  const config = await getWhitelabelConfig();
  STATIC_CONFIG = config;
  return {
    APP: {
      NAME: config.app.name,
      TAGLINE: config.app.tagline,
      SUBTITLE: config.app.subtitle,
      DESCRIPTION: config.app.description,
    },
    BRANDING: {
      COLLEGE_NAME: config.branding.college_name,
      PORTAL_NAME: config.branding.portal_name,
      COLORS: config.branding.colors,
    },
    IMAGES: {
      COLLEGE_LOGO: config.branding.logo.url,
      COLLEGE_LOGO_FALLBACK: config.branding.logo.fallback,
      FAVICON: config.branding.favicon,
      BADGE_IMAGES: config.badge_images,
    },
    FORMS: config.forms,
    FORM_LABELS: config.forms.labels,
    FORM_PLACEHOLDERS: config.forms.placeholders,
    FORM_SHIFT_OPTIONS: config.forms.shift_options,
    FORM_ROLE_OPTIONS: config.forms.role_options,
    MESSAGES: config.messages,
    AUTH_MESSAGES: config.messages.auth,
    ERROR_MESSAGES: config.messages.errors,
    SYSTEM: {
      DEFAULT_POINTS: config.app.welcome_points,
      PERFORMANCE: config.system.performance,
      SECURITY: config.system.security,
      ISO_COMPLIANCE: config.system.iso_compliance,
    },
    ADMIN: config.admin,
  } as const;
}

// Legacy export for compatibility
export const WHITELABEL_CONFIG = {
  get APP_NAME() { return STATIC_CONFIG?.app.name; },
  get APP_TAGLINE() { return STATIC_CONFIG?.app.tagline; },
  get APP_SUBTITLE() { return STATIC_CONFIG?.app.subtitle; },
  get APP_DESCRIPTION() { return STATIC_CONFIG?.app.description; },
  get BRANDING() { return STATIC_CONFIG?.branding; },
  get COLLEGE_NAME() { return STATIC_CONFIG?.branding.college_name; },
  get PORTAL_NAME() { return STATIC_CONFIG?.branding.portal_name; },
  get COLORS() { return STATIC_CONFIG?.branding.colors; },
  get IMAGES() { return STATIC_CONFIG ? {
    COLLEGE_LOGO: STATIC_CONFIG.branding.logo.url,
    COLLEGE_LOGO_FALLBACK: STATIC_CONFIG.branding.logo.fallback,
    FAVICON: STATIC_CONFIG.branding.favicon,
    BADGE_IMAGES: STATIC_CONFIG.badge_images,
  } : undefined; },
  get LOGO_URL() { return STATIC_CONFIG?.branding.logo.url; },
  get FAVICON_URL() { return STATIC_CONFIG?.branding.favicon; },
  get COLLEGE_LOGO_FALLBACK() { return STATIC_CONFIG?.branding.logo.fallback; },
  get BADGE_IMAGES() { return STATIC_CONFIG?.badge_images; },
  get FORM_LABELS() { return STATIC_CONFIG?.forms.labels; },
  get FORM_PLACEHOLDERS() { return STATIC_CONFIG?.forms.placeholders; },
  get FORM_SHIFT_OPTIONS() { return STATIC_CONFIG?.forms.shift_options; },
  get FORM_ROLE_OPTIONS() { return STATIC_CONFIG?.forms.role_options; },
  get AUTH_MESSAGES() { return STATIC_CONFIG?.messages.auth; },
  get ERROR_MESSAGES() { return STATIC_CONFIG?.messages.errors; },
  get NAVIGATION_MESSAGES() { return STATIC_CONFIG?.messages.navigation; },
  get PRODUCT_MESSAGES() { return STATIC_CONFIG?.messages.products; },
  get LOADING_STATES() { return STATIC_CONFIG?.messages.loading; },
  get SUCCESS_MESSAGES() { return STATIC_CONFIG?.messages.success; },
  get SYSTEM_CONFIG() { return STATIC_CONFIG?.system; },
  get DEFAULT_POINTS() { return STATIC_CONFIG?.app.welcome_points; },
  get PERFORMANCE() { return STATIC_CONFIG?.system.performance; },
  get SECURITY() { return STATIC_CONFIG?.system.security; },
  get ADMIN_CONFIG() { return STATIC_CONFIG?.admin; },
};
