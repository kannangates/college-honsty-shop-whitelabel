import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { theme as defaultTheme } from '@/config/theme';
import branding from '@/config/branding';
import { BrandingContext } from './context';
import { BrandingProviderProps } from './types';
import { Theme } from '@/config/theme.types';

// Create a theme object that combines branding and theme
const createMergedTheme = (customTheme?: Partial<Theme>): Theme => {
  const baseTheme = {
    ...defaultTheme,
    colors: {
      ...defaultTheme.colors,
      // Apply branding color overrides if they exist
      ...(branding.theme?.colors || {}),
    },
  };

  if (!customTheme) return baseTheme;

  return {
    ...baseTheme,
    ...customTheme,
    colors: {
      ...baseTheme.colors,
      ...(customTheme.colors || {})
    },
    typography: {
      ...baseTheme.typography,
      ...(customTheme.typography || {})
    },
    spacing: {
      ...baseTheme.spacing,
      ...(customTheme.spacing || {})
    },
    breakpoints: {
      ...baseTheme.breakpoints,
      ...(customTheme.breakpoints || {})
    }
  };
};

export function BrandingProvider({ 
  children, 
  initialDarkMode = false,
  theme: customTheme
}: BrandingProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(initialDarkMode);
  
  // Create the merged theme
  const theme = useMemo<Theme>(
    () => createMergedTheme(customTheme),
    [customTheme]
  );

  // Toggle dark mode and save preference to localStorage
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', String(newValue));
      }
      return newValue;
    });
  }, []);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check localStorage first
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      setIsDarkMode(savedMode === 'true');
      return;
    }

    // Fall back to system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    // Listen for system preference changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply dark mode class to document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Apply CSS variables for theme colors
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--color-${key}`, value);
      }
    });
    
    // Apply typography variables
    if (theme.typography) {
      Object.entries(theme.typography).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--font-${key}`, value);
        } else if (typeof value === 'number') {
          root.style.setProperty(`--font-${key}`, value.toString());
        } else if (value) {
          // Handle nested typography objects (like fontSize, fontWeight, etc.)
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (subValue) {
              root.style.setProperty(
                `--font-${key}-${subKey}`, 
                typeof subValue === 'number' ? `${subValue}px` : String(subValue)
              );
            }
          });
        }
      });
    }
    
    // Apply spacing variables
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--spacing-${key}`, 
            typeof value === 'number' ? `${value}px` : String(value)
          );
        }
      });
    }
    
    // Apply border radius variables
    if (theme.borderRadius) {
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--radius-${key}`, 
            typeof value === 'number' ? `${value}px` : String(value)
          );
        }
      });
    }
  }, [theme]);

  const contextValue = useMemo(() => ({
    theme,
    isDarkMode,
    toggleDarkMode,
  }), [theme, isDarkMode, toggleDarkMode]);

  return (
    <BrandingContext.Provider value={contextValue}>
      {children}
    </BrandingContext.Provider>
  );
}
