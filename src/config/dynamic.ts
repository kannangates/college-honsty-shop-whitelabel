// Dynamic Configuration System - Uses Branding Loader
import { initializeBranding, type BrandingTheme, type BrandingConfig, type BrandingMessages } from '@/utils/brandingLoader';

// Global branding state
let currentBranding: {
  theme: BrandingTheme;
  config: BrandingConfig;
  messages: BrandingMessages;
} | null = null;

// Initialize branding once
let brandingPromise: Promise<any> | null = null;

export async function getBrandingConfig() {
  if (currentBranding) {
    return currentBranding;
  }

  if (!brandingPromise) {
    brandingPromise = initializeBranding();
  }

  currentBranding = await brandingPromise;
  return currentBranding;
}

// Synchronous getters (with fallbacks for SSR)
export function getCurrentTheme(): BrandingTheme {
  return currentBranding?.theme || {
    name: "Loading...",
    portal_name: "Loading...",
    tagline: "Loading...",
    subtitle: "Loading...",
    description: "Loading...",
    colors: {
      primary: "#3b82f6",
      secondary: "#64748b", 
      accent: "#f1f5f9"
    },
    logo: {
      url: "/logo.png",
      fallback: "https://cdn.jsdelivr.net/gh/lucide-icons/lucide@0.263.1/icons/graduation-cap.svg"
    },
    favicon: "/logo.png"
  };
}

export function getCurrentConfig(): BrandingConfig {
  return currentBranding?.config || {
    app: {
      name: "Loading...",
      welcome_points: 100
    },
    forms: {
      labels: {},
      placeholders: {},
      shift_options: [],
      role_options: []
    },
    system: {
      performance: {},
      security: {},
      iso_compliance: {}
    }
  };
}

export function getCurrentMessages(): BrandingMessages {
  return currentBranding?.messages || {
    auth: {},
    navigation: {},
    products: {},
    errors: {},
    loading: {},
    success: {}
  };
}