// Dynamic Branding Configuration Loader
export interface BrandingTheme {
  name: string;
  portal_name: string;
  tagline: string;
  subtitle: string;
  description: string;
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
}

export interface BrandingConfig {
  app: {
    name: string;
    welcome_points: number;
  };
  forms: {
    labels: Record<string, string>;
    placeholders: Record<string, string>;
    shift_options: Array<{ value: string; label: string }>;
    role_options: Array<{ value: string; label: string }>;
  };
  system: {
    performance: Record<string, any>;
    security: Record<string, any>;
    iso_compliance: Record<string, any>;
  };
}

export interface BrandingMessages {
  auth: Record<string, string>;
  navigation: Record<string, string>;
  products: Record<string, string>;
  errors: Record<string, string>;
  loading: Record<string, string>;
  success: Record<string, string>;
}

// Detect college code from environment or subdomain
export function detectCollegeCode(): string {
  // First, try environment variable
  const envCollegeCode = import.meta.env.VITE_COLLEGE_CODE || 
                        (typeof process !== 'undefined' && process.env?.COLLEGE_CODE);
  if (envCollegeCode) {
    return envCollegeCode;
  }

  // Then try subdomain detection
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const baseDomain = import.meta.env.VITE_BASE_DOMAIN || 'lovable.app';
    
    // Check if it's a subdomain
    if (hostname.includes('.') && !hostname.endsWith(baseDomain)) {
      const subdomain = hostname.split('.')[0];
      // Map common subdomains to college codes
      const subdomainMap: Record<string, string> = {
        'shasun': 'shasun',
        'collegea': 'college_a',
        'collegeb': 'college_b',
      };
      return subdomainMap[subdomain] || 'default';
    }
  }

  return 'default';
}

// Load branding configuration dynamically
export async function loadBrandingConfig(): Promise<{
  theme: BrandingTheme;
  config: BrandingConfig;
  messages: BrandingMessages;
}> {
  const collegeCode = detectCollegeCode();
  
  try {
    // Dynamic imports for college-specific configurations
    const [themeModule, configModule, messagesModule] = await Promise.all([
      import(`../../branding/${collegeCode}/theme.json`),
      import(`../../branding/${collegeCode}/config.json`),
      import(`../../branding/${collegeCode}/messages.json`)
    ]);

    return {
      theme: themeModule.default,
      config: configModule.default,
      messages: messagesModule.default
    };
  } catch (error) {
    console.warn(`⚠️ Failed to load branding for ${collegeCode}, falling back to default:`, error);
    
    // Fallback to default branding
    try {
      const [themeModule, configModule, messagesModule] = await Promise.all([
        import(`../../branding/default/theme.json`),
        import(`../../branding/default/config.json`),
        import(`../../branding/default/messages.json`)
      ]);

      return {
        theme: themeModule.default,
        config: configModule.default,
        messages: messagesModule.default
      };
    } catch (fallbackError) {
      console.error('❌ Failed to load default branding:', fallbackError);
      throw new Error('Unable to load branding configuration');
    }
  }
}

// Apply theme colors to CSS custom properties
export function applyThemeColors(colors: BrandingTheme['colors']) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  
  // Convert hex to HSL for CSS custom properties
  const hexToHsl = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

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
  
  console.log(`✅ Applied ${detectCollegeCode()} theme colors:`, colors);
}

// Initialize branding on app start
export async function initializeBranding(): Promise<{
  theme: BrandingTheme;
  config: BrandingConfig;
  messages: BrandingMessages;
}> {
  const branding = await loadBrandingConfig();
  
  // Apply theme colors
  applyThemeColors(branding.theme.colors);
  
  // Update favicon if different from default
  if (typeof document !== 'undefined' && branding.theme.favicon !== '/logo.png') {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = branding.theme.favicon;
    }
  }
  
  console.log(`🎨 Initialized branding for: ${branding.theme.name}`);
  return branding;
}