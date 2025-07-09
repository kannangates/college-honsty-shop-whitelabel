import { Theme } from '@/config/theme.types';

/**
 * The shape of the branding context value
 */
export interface BrandingContextType {
  /**
   * The current theme object containing all design tokens
   */
  theme: Theme;
  
  /**
   * Whether dark mode is currently enabled
   */
  isDarkMode: boolean;
  
  /**
   * Function to toggle dark mode
   */
  toggleDarkMode: () => void;
}

/**
 * Props for the BrandingProvider component
 */
export interface BrandingProviderProps {
  /**
   * Child components that will have access to the branding context
   */
  children: React.ReactNode;
  
  /**
   * Initial dark mode state (defaults to false)
   */
  initialDarkMode?: boolean;
  
  /**
   * Optional theme overrides to customize the default theme
   */
  theme?: Partial<Theme>;
}

/**
 * Type for responsive values that can vary by breakpoint
 */
export type ResponsiveValue<T> = {
  [breakpoint: string]: T;
  default: T;
};

/**
 * Type for breakpoint names
 */
export type BreakpointName = keyof Theme['breakpoints'];

/**
 * Type for theme color names
 */
export type ColorName = keyof Theme['colors'];

/**
 * Type for typography variant names
 */
export type TypographyVariant = keyof Theme['typography']['variants'];

/**
 * Type for spacing scale names
 */
export type SpacingScale = keyof Theme['spacing'];

/**
 * Type for border radius scale names
 */
export type BorderRadiusScale = keyof Theme['borderRadius'];

/**
 * Type for box shadow scale names
 */
export type BoxShadowScale = keyof Theme['boxShadow'];

/**
 * Type for z-index scale names
 */
export type ZIndexScale = keyof Theme['zIndex'];
