// App Configuration
// =========================================
// This file contains the main application configuration.

// =========================================================
// App Configuration
// =========================================================

// Feature Flags
type FeatureFlags = {
  [key: string]: boolean;
};

// App-wide configuration
type AppConfig = {
  // App Info
  APP_NAME: string;
  APP_DESCRIPTION: string;
  APP_VERSION: string;
  
  // API Configuration
  API_BASE_URL: string;
  API_TIMEOUT: number;
  
  // Branding
  BRANDING: {
    COLLEGE_NAME: string;
    PORTAL_NAME: string;
    COLORS: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  
  // Features
  FEATURES: FeatureFlags;
  
  // Other configurations
  PAGINATION: {
    DEFAULT_PAGE_SIZE: number;
    PAGE_SIZE_OPTIONS: number[];
  };
  
  // Forms
  FORMS: {
    VALIDATION: {
      REQUIRED: string;
      EMAIL: string;
      MIN_LENGTH: (length: number) => string;
      MAX_LENGTH: (length: number) => string;
      PASSWORD_MATCH: string;
    };
    
    PLACEHOLDERS: {
      EMAIL: string;
      PASSWORD: string;
      SEARCH: string;
    };
  };
  
  // Messages
  MESSAGES: {
    AUTH: {
      LOGIN_SUCCESS: string;
      LOGOUT_SUCCESS: string;
      REGISTER_SUCCESS: string;
      RESET_PASSWORD_SUCCESS: string;
      RESET_PASSWORD_CONFIRMATION: string;
    };
    
    NAVIGATION: {
      CONFIRM_LEAVE: string;
      SESSION_EXPIRED: string;
    };
    
    PRODUCTS: {
      ADDED_TO_CART: string;
      REMOVED_FROM_CART: string;
      OUT_OF_STOCK: string;
    };
    
    ERRORS: {
      GENERIC: string;
      NETWORK: string;
      UNAUTHORIZED: string;
      NOT_FOUND: string;
      SERVER_ERROR: string;
    };
    
    LOADING: {
      DEFAULT: string;
      SUBMITTING: string;
      PROCESSING: string;
    };
    
    SUCCESS: {
      CHANGES_SAVED: string;
      ACTION_COMPLETED: string;
    };
  };
  
  // System configuration
  SYSTEM: {
    CONFIG: {
      ENVIRONMENT: string;
      DEBUG: boolean;
      VERSION: string;
    };
    
    POINTS: {
      DEFAULT_POINTS: number;
      WELCOME_POINTS: number;
      REFERRAL_BONUS: number;
    };
    
    PERFORMANCE: {
      API_CACHE_TTL: number;
      ASSET_CACHE_TTL: number;
      LAZY_LOAD_OFFSET: number;
    };
    
    SECURITY: {
      PASSWORD_MIN_LENGTH: number;
      PASSWORD_REQUIREMENTS: {
        UPPERCASE: boolean;
        LOWERCASE: boolean;
        NUMBER: boolean;
        SPECIAL_CHAR: boolean;
      };
      SESSION_TIMEOUT: number;
      MAX_LOGIN_ATTEMPTS: number;
      LOCKOUT_DURATION: number;
    };
    
    COMPLIANCE: {
      GDPR: boolean;
      CCPA: boolean;
      HIPAA: boolean;
      PCI_DSS: boolean;
    };
  };
  
  // Admin configuration
  ADMIN: {
    SETTINGS: {
      ITEMS_PER_PAGE: number;
      MAX_UPLOAD_SIZE: number;
      ALLOWED_FILE_TYPES: string[];
    };
    
    ACCESS: {
      ROLES: string[];
      PERMISSIONS: {
        MANAGE_USERS: string[];
        MANAGE_CONTENT: string[];
        VIEW_REPORTS: string[];
      };
    };
  };
};

// Default configuration
const CONFIG: AppConfig = {
  // App Info
  APP_NAME: 'College Portal',
  APP_DESCRIPTION: 'A modern portal for college management',
  APP_VERSION: '1.0.0',
  
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  API_TIMEOUT: 30000, // 30 seconds
  
  // Branding - These values are now managed by the BrandingProvider
  BRANDING: {
    COLLEGE_NAME: 'Shasun College',
    PORTAL_NAME: 'Campus Connect',
    COLORS: {
      primary: '#1976d2',
      secondary: '#9c27b0',
      accent: '#ff4081',
    },
  },
  
  // Features
  FEATURES: {
    DARK_MODE: true,
    NOTIFICATIONS: true,
    ANALYTICS: false,
    MAINTENANCE_MODE: false,
  },
  
  // Other configurations
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  },
  
  // Forms
  FORMS: {
    VALIDATION: {
      REQUIRED: 'This field is required',
      EMAIL: 'Please enter a valid email address',
      MIN_LENGTH: (length: number) => `Must be at least ${length} characters`,
      MAX_LENGTH: (length: number) => `Must be at most ${length} characters`,
      PASSWORD_MATCH: 'Passwords do not match',
    },
    
    PLACEHOLDERS: {
      EMAIL: 'Enter your email',
      PASSWORD: 'Enter your password',
      SEARCH: 'Search...',
    },
  },
  
  // Messages
  MESSAGES: {
    AUTH: {
      LOGIN_SUCCESS: 'Successfully logged in',
      LOGOUT_SUCCESS: 'Successfully logged out',
      REGISTER_SUCCESS: 'Account created successfully',
      RESET_PASSWORD_SUCCESS: 'Password reset email sent',
      RESET_PASSWORD_CONFIRMATION: 'Your password has been reset',
    },
    
    NAVIGATION: {
      CONFIRM_LEAVE: 'You have unsaved changes. Are you sure you want to leave?',
      SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    },
    
    PRODUCTS: {
      ADDED_TO_CART: 'Added to cart',
      REMOVED_FROM_CART: 'Removed from cart',
      OUT_OF_STOCK: 'Out of stock',
    },
    
    ERRORS: {
      GENERIC: 'Something went wrong. Please try again.',
      NETWORK: 'Network error. Please check your connection.',
      UNAUTHORIZED: 'You are not authorized to perform this action.',
      NOT_FOUND: 'The requested resource was not found.',
      SERVER_ERROR: 'Server error. Please try again later.',
    },
    
    LOADING: {
      DEFAULT: 'Loading...',
      SUBMITTING: 'Submitting...',
      PROCESSING: 'Processing...',
    },
    
    SUCCESS: {
      CHANGES_SAVED: 'Your changes have been saved.',
      ACTION_COMPLETED: 'Action completed successfully.',
    },
  },
  
  // System configuration
  SYSTEM: {
    CONFIG: {
      ENVIRONMENT: import.meta.env.MODE || 'development',
      DEBUG: import.meta.env.DEBUG === 'true',
      VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    },
    
    POINTS: {
      DEFAULT_POINTS: 100,
      WELCOME_POINTS: 50,
      REFERRAL_BONUS: 25,
    },
    
    PERFORMANCE: {
      API_CACHE_TTL: 300000, // 5 minutes
      ASSET_CACHE_TTL: 86400000, // 24 hours
      LAZY_LOAD_OFFSET: 200, // pixels from viewport to start loading
    },
    
    SECURITY: {
      PASSWORD_MIN_LENGTH: 8,
      PASSWORD_REQUIREMENTS: {
        UPPERCASE: true,
        LOWERCASE: true,
        NUMBER: true,
        SPECIAL_CHAR: true,
      },
      SESSION_TIMEOUT: 1800000, // 30 minutes
      MAX_LOGIN_ATTEMPTS: 5,
      LOCKOUT_DURATION: 900000, // 15 minutes
    },
    
    COMPLIANCE: {
      GDPR: true,
      CCPA: true,
      HIPAA: false,
      PCI_DSS: false,
    },
  },
  
  // Admin configuration
  ADMIN: {
    SETTINGS: {
      ITEMS_PER_PAGE: 25,
      MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
      ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
    },
    
    ACCESS: {
      ROLES: ['admin', 'editor', 'viewer'],
      PERMISSIONS: {
        MANAGE_USERS: ['admin'],
        MANAGE_CONTENT: ['admin', 'editor'],
        VIEW_REPORTS: ['admin', 'editor', 'viewer'],
      },
    },
  },
};

// Export configuration as default
export default {
  // App Info
  get APP_NAME() { return CONFIG.APP_NAME; },
  get APP_DESCRIPTION() { return CONFIG.APP_DESCRIPTION; },
  get APP_VERSION() { return CONFIG.APP_VERSION; },
  
  // API Configuration
  get API_BASE_URL() { return CONFIG.API_BASE_URL; },
  get API_TIMEOUT() { return CONFIG.API_TIMEOUT; },
  
  // Branding
  get BRANDING() { return CONFIG.BRANDING; },
  get COLLEGE_NAME() { return CONFIG.BRANDING.COLLEGE_NAME; },
  get PORTAL_NAME() { return CONFIG.BRANDING.PORTAL_NAME; },
  get COLORS() { return CONFIG.BRANDING.COLORS; },
  
  // Features
  get FEATURES() { return CONFIG.FEATURES; },
  isFeatureEnabled: (feature: string) => CONFIG.FEATURES[feature] === true,
  
  // Forms
  get FORMS() { return CONFIG.FORMS; },
  
  // Messages
  get MESSAGES() { return CONFIG.MESSAGES; },
  
  // System
  get SYSTEM() { return CONFIG.SYSTEM; },
  
  // Admin
  get ADMIN() { return CONFIG.ADMIN; },
  
  // Helper methods
  getConfig: <T>(key: string, defaultValue?: T): T => {
    const keys = key.split('.');
    let value: unknown = CONFIG;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return defaultValue as T;
      }
    }
    
    return value as T;
  },
};
