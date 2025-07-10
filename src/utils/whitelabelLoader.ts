// Single Source of Truth Whitelabel Configuration Loader
export interface WhitelabelConfig {
  app: {
    name: string;
    welcome_points: number;
    tagline: string;
    subtitle: string;
    description: string;
  };
  branding: {
    college_name: string;
    portal_name: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    logo: {
      url: string;
      fallback: string;
    };
    favicon: string;
  };
  forms: {
    labels: Record<string, string>;
    placeholders: Record<string, string>;
    shift_options: Array<{ value: string; label: string }>;
    role_options: Array<{ value: string; label: string }>;
  };
  messages: {
    auth: Record<string, string>;
    navigation: Record<string, string>;
    products: Record<string, string>;
    errors: Record<string, string>;
    loading: Record<string, string>;
    success: Record<string, string>;
  };
  system: {
    performance: Record<string, unknown>;
    security: Record<string, unknown>;
    iso_compliance: Record<string, unknown>;
  };
  badge_images: {
    achievement_badge: string;
    honor_badge: string;
    excellence_badge: string;
  };
  admin: {
    access_note: string;
  };
}

// Load whitelabel configuration from single source
export async function loadWhitelabelConfig(): Promise<WhitelabelConfig> {
  try {
    // Import the whitelabel configuration
    const configModule = await import('../../whitelabel.json');
    return configModule.default;
  } catch (error) {
    console.error('❌ Failed to load whitelabel configuration:', error);
    throw new Error('Unable to load whitelabel configuration');
  }
}

// Apply theme colors to CSS custom properties
export function applyThemeColors(colors: WhitelabelConfig['branding']['colors']) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  
  // Convert hex to HSL for CSS custom properties
  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h: number, s: number;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  // Update CSS custom properties
  root.style.setProperty('--primary', hexToHsl(colors.primary));
  root.style.setProperty('--secondary', hexToHsl(colors.secondary));
  root.style.setProperty('--accent', hexToHsl(colors.accent));
  
  console.log('✅ Applied whitelabel theme colors:', colors);
}

// Initialize whitelabel configuration on app start
export async function initializeWhitelabel(): Promise<WhitelabelConfig> {
  const config = await loadWhitelabelConfig();
  
  // Apply theme colors
  applyThemeColors(config.branding.colors);
  
  // Update favicon if different from default
  if (typeof document !== 'undefined' && config.branding.favicon !== '/logo.png') {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = config.branding.favicon;
    }
  }
  
  console.log(`🎨 Initialized whitelabel for: ${config.branding.college_name}`);
  return config;
} 