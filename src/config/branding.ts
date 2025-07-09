import * as React from 'react';
import { createContext, useContext, useMemo, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks';
import { Theme } from './theme.types';

// =========================================
// Branding Configuration
// =========================================

// Branding configuration type
type BrandingConfig = {
  college: {
    name: string;
    shortName: string;
    location: string;
    website: string;
    email: string;
    phone: string;
    address: string;
    logo: string;
    favicon: string;
  };
  portal: {
    name: string;
    description: string;
    themeColor: string;
    version?: string;
  };
  theme: Theme;
  features: Record<string, boolean>;
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
};

/**
 * Default branding configuration for Shasun College
 * This is the single source of truth for all branding in the application
 */
export const branding: BrandingConfig = {
  // College information
  college: {
    name: 'Shasun College',
    shortName: 'Shasun',
    location: 'Chennai, India',
    website: 'https://shasuncbe.edu.in',
    email: 'info@shasuncbe.edu.in',
    phone: '+91 44 2442 4200',
    address: 'Shasun College, 864, Poonamallee High Road, Kilpauk, Chennai - 600010',
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

  // Theme configuration
  theme: {
    colors: {
      primary: '#1a56db',
      primaryLight: '#1e40af',
      primaryDark: '#1e3a8a',
      secondary: '#7e3af2',
      secondaryLight: '#6c2bd9',
      secondaryDark: '#5521b5',
      accent: '#f59e0b',
      accentLight: '#d97706',
      accentDark: '#b45309',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
      white: '#ffffff',
      gray100: '#f3f4f6',
      gray200: '#e5e7eb',
      gray300: '#d1d5db',
      gray400: '#9ca3af',
      gray500: '#6b7280',
      gray600: '#4b5563',
      gray700: '#374151',
      gray800: '#1f2937',
      gray900: '#111827',
      black: '#000000',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textSecondary: '#4b5563',
      textDisabled: '#9ca3af',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      borderDark: '#d1d5db',
    },
    typography: {
      fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontFamilyMono:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSizeBase: '1rem',
      fontSizeXs: '0.75rem',
      fontSizeSm: '0.875rem',
      fontSizeMd: '1rem',
      fontSizeLg: '1.125rem',
      fontSizeXl: '1.25rem',
      fontSize2xl: '1.5rem',
      fontSize3xl: '1.875rem',
      fontSize4xl: '2.25rem',
      fontWeightLight: 300,
      fontWeightNormal: 400,
      fontWeightMedium: 500,
      fontWeightSemibold: 600,
      fontWeightBold: 700,
      lineHeightNone: 1,
      lineHeightTight: 1.25,
      lineHeightNormal: 1.5,
      lineHeightRelaxed: 1.75,
    },
    spacing: {
      px: '1px',
      '0': '0',
      '0.5': '0.125rem',
      '1': '0.25rem',
      '1.5': '0.375rem',
      '2': '0.5rem',
      '2.5': '0.625rem',
      '3': '0.75rem',
      '3.5': '0.875rem',
      '4': '1rem',
      '5': '1.25rem',
      '6': '1.5rem',
      '7': '1.75rem',
      '8': '2rem',
      '9': '2.25rem',
      '10': '2.5rem',
      '11': '2.75rem',
      '12': '3rem',
      '14': '3.5rem',
      '16': '4rem',
      '20': '5rem',
      '24': '6rem',
      '28': '7rem',
      '32': '8rem',
      '36': '9rem',
      '40': '10rem',
      '44': '11rem',
      '48': '12rem',
      '52': '13rem',
      '56': '14rem',
      '60': '15rem',
      '64': '16rem',
      '72': '18rem',
      '80': '20rem',
      '96': '24rem',
    },
    borderRadius: {
      none: '0px',
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px',
    },
    boxShadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      none: 'none',
    },
    zIndex: {
      auto: 'auto',
      '0': '0',
      '10': '10',
      '20': '20',
      '30': '30',
      '40': '40',
      '50': '50',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  } as const,

  // Features
  features: {
    darkMode: true,
    notifications: true,
    announcements: true,
    events: true,
    attendance: true,
    assignments: true,
    results: true,
    library: true,
    hostel: true,
    transport: true,
    fees: true,
    alumni: true,
  },

  // Social media links
  social: {
    facebook: 'https://facebook.com/shasuncollege',
    twitter: 'https://twitter.com/shasuncollege',
    instagram: 'https://instagram.com/shasuncollege',
    linkedin: 'https://linkedin.com/school/shasun-college',
    youtube: 'https://youtube.com/shasuncollege',
  },
} as const;

// =========================================
// Branding Context
// =========================================

type BrandingContextType = {
  branding: BrandingConfig;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

// =========================================
// Branding Provider
// =========================================

type BrandingProviderProps = {
  children: React.ReactNode;
  initialDarkMode?: boolean;
};

export function BrandingProvider({ 
  children, 
  initialDarkMode = false 
}: BrandingProviderProps) {
  const [isDarkMode, setDarkMode] = useLocalStorage('darkMode', initialDarkMode);

  const toggleDarkMode = React.useCallback(() => {
    setDarkMode((prev: boolean) => !prev);
  }, [setDarkMode]);

  // Apply theme class to HTML element
  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(isDarkMode ? 'light' : 'dark');
    root.classList.add(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const contextValue = React.useMemo<BrandingContextType>(() => ({
    branding,
    isDarkMode,
    toggleDarkMode,
  }), [isDarkMode, toggleDarkMode]);

  return React.createElement(
    BrandingContext.Provider,
    { value: contextValue },
    children
  );
}

// =========================================
// Branding Hooks
// =========================================

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}

export function useTheme() {
  const { branding: { theme }, isDarkMode } = useBranding();
  return { ...theme, isDarkMode };
}

export function useColors() {
  const { colors } = useTheme();
  return colors;
}

export function useTypography() {
  const { typography } = useTheme();
  return typography;
}

// =========================================
// Branding Utilities
// =========================================

/**
 * Helper function to update branding configuration
 * @param updates Partial branding configuration to update
 * @returns Updated branding configuration
 */
export function updateBranding(updates: Partial<BrandingConfig>): BrandingConfig {
  return {
    ...branding,
    ...updates,
    college: {
      ...branding.college,
      ...(updates.college || {}),
    },
    portal: {
      ...branding.portal,
      ...(updates.portal || {}),
    },
    theme: {
      ...branding.theme,
      ...(updates.theme || {}),
      colors: {
        ...branding.theme.colors,
        ...(updates.theme?.colors || {}),
      },
    },
    features: {
      ...branding.features,
      ...(updates.features || {}),
    },
    social: {
      ...branding.social,
      ...(updates.social || {}),
    },
  };
}

export default branding;
