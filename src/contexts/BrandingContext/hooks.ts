import { useContext, useMemo } from 'react';
import { BrandingContext } from './context';
import { Theme, ThemeFeatures } from '@/config/theme.types';

/**
 * Hook to access the branding context
 * @returns The branding context value
 */
export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}

/**
 * Hook to access the theme object
 * @returns The theme object
 */
export function useTheme(): Theme {
  const { theme } = useBranding();
  return theme;
}

/**
 * Hook to access theme colors
 * @returns Theme colors object
 */
export function useColors() {
  const { colors } = useTheme();
  return colors;
}

/**
 * Hook to access theme typography
 * @returns Theme typography object
 */
export function useTypography() {
  const { typography } = useTheme();
  return typography;
}

/**
 * Hook to access theme spacing
 * @returns Theme spacing object
 */
export function useSpacing() {
  const { spacing } = useTheme();
  return spacing;
}

/**
 * Hook to access theme border radius
 * @returns Theme border radius object
 */
export function useBorderRadius() {
  const { borderRadius } = useTheme();
  return borderRadius;
}

/**
 * Hook to access theme box shadow
 * @returns Theme box shadow object
 */
export function useBoxShadow() {
  const { boxShadow } = useTheme();
  return boxShadow;
}

/**
 * Hook to access theme z-index values
 * @returns Theme z-index object
 */
export function useZIndex() {
  const { zIndex } = useTheme();
  return zIndex;
}

/**
 * Hook to access theme assets
 * @returns Theme assets object
 */
export function useAssets() {
  const { assets } = useTheme();
  return useMemo(() => ({
    ...(assets || {
      logo: '/logo/logo.svg',
      logoDark: '/logo/logo-dark.svg',
      logoIcon: '/logo/logo-icon.svg',
      favicon: '/favicon.ico',
    })
  }), [assets]);
}

/**
 * Hook to access theme features
 * @returns Theme features object
 */
export function useFeatures() {
  const { features } = useTheme();
  return features || {};
}

/**
 * Hook to check if a feature is enabled
 * @param feature - The feature key to check
 * @returns Boolean indicating if the feature is enabled
 */
export function useFeatureFlag(feature: keyof ThemeFeatures): boolean {
  const features = useFeatures();
  return Boolean(features?.[feature as string]);
}

/**
 * Hook to access dark mode state and toggle function
 * @returns Object containing isDarkMode and toggleDarkMode
 */
export function useDarkMode() {
  const { isDarkMode, toggleDarkMode } = useBranding();
  return { isDarkMode, toggleDarkMode };
}

/**
 * Hook to access theme metadata
 * @returns Theme metadata object
 */
export function useThemeMeta() {
  const { meta } = useTheme();
  return meta || {};
}
