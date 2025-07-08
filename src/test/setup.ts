import '@testing-library/jest-dom';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })),
    rpc: jest.fn(),
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// ---------------------------------------------------------------------------
// Mock utils/authUtils to avoid import.meta and complex validation logic
// ---------------------------------------------------------------------------

jest.mock('@/utils/authUtils', () => ({
  __esModule: true,
  BACKDOOR_USERNAME: '',
  BACKDOOR_PASSWORD: '',
  validateStudentId: () => true,
  validatePassword: () => true,
  validatePasswordMatch: () => true,
}));

// ---------------------------------------------------------------------------
// Mock unified config module (src/config.ts) to sidestep Vite-only features
// ---------------------------------------------------------------------------

jest.mock('@/config', () => {
  const dummyTheme = {
    name: 'Test College',
    portal_name: 'Test Portal',
    tagline: 'Testing Makes Perfect',
    subtitle: 'Unit-test edition',
    description: 'A mock branding description',
    colors: {
      primary: '#000000',
    },
    logo: { url: '/logo.png', fallback: '/logo-fallback.png' },
    favicon: '/favicon.ico',
  };

  const dummyConfig = {
    app: {
      name: 'Honsty Shop',
      welcome_points: 10,
    },
    forms: { labels: {}, placeholders: {} },
    system: {
      performance: {},
      security: {},
      iso_compliance: {},
    },
  };

  const dummyMessages = { greeting: 'Hello, tests!' };

  const CONFIG = {
    APP: {
      NAME: dummyConfig.app.name,
      TAGLINE: dummyTheme.tagline,
      SUBTITLE: dummyTheme.subtitle,
      DESCRIPTION: dummyTheme.description,
    },
    BRANDING: {
      COLLEGE_NAME: dummyTheme.name,
      PORTAL_NAME: dummyTheme.portal_name,
      COLORS: dummyTheme.colors,
    },
    SUPABASE: {},
    IMAGES: {
      COLLEGE_LOGO: dummyTheme.logo.url,
      COLLEGE_LOGO_FALLBACK: dummyTheme.logo.fallback,
      FAVICON: dummyTheme.favicon,
      BADGE_IMAGES: {},
    },
    FORMS: dummyConfig.forms,
    MESSAGES: dummyMessages,
    SYSTEM: dummyConfig.system,
    ADMIN: {},
  } as const;

  return {
    __esModule: true,
    getCurrentTheme: () => dummyTheme,
    getCurrentConfig: () => dummyConfig,
    getCurrentMessages: () => dummyMessages,
    getBrandingConfig: async () => ({ theme: dummyTheme, config: dummyConfig, messages: dummyMessages }),
    CONFIG,
    SYSTEM_CONFIG: CONFIG.SYSTEM,
    WHITELABEL_CONFIG: CONFIG, // minimal
  };
}); 