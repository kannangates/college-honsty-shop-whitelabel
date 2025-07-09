import { Theme } from './theme.types';

// Shasun College Brand Colors
export const colors: Theme['colors'] = {
  // Primary Colors
  primary: '#004080',    // Dark Blue
  primaryLight: '#336699',
  primaryDark: '#002b4d',
  
  // Secondary Colors
  secondary: '#e66166',  // Coral Red
  secondaryLight: '#eb8080',
  secondaryDark: '#d64a4f',
  
  // Accent Colors
  accent: '#ffcc00',     // Gold
  accentLight: '#ffd633',
  accentDark: '#e6b800',
  
  // Status Colors
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#17a2b8',
  
  // Grayscale
  white: '#ffffff',
  gray100: '#f8f9fa',
  gray200: '#e9ecef',
  gray300: '#dee2e6',
  gray400: '#ced4da',
  gray500: '#adb5bd',
  gray600: '#6c757d',
  gray700: '#495057',
  gray800: '#343a40',
  gray900: '#212529',
  black: '#000000',
  
  // Backgrounds
  background: '#f8f9fa',
  surface: '#ffffff',
  
  // Text
  text: '#212529',
  textSecondary: '#6c757d',
  textDisabled: '#adb5bd',
  
  // Borders
  border: '#dee2e6',
  borderLight: '#e9ecef',
  borderDark: '#ced4da',
};

// Typography
export const typography: Theme['typography'] = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontFamilyMono: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  
  // Font Sizes (in rem)
  fontSizeBase: '1rem',
  fontSizeXs: '0.75rem',
  fontSizeSm: '0.875rem',
  fontSizeMd: '1rem',
  fontSizeLg: '1.125rem',
  fontSizeXl: '1.25rem',
  fontSize2xl: '1.5rem',
  fontSize3xl: '1.875rem',
  fontSize4xl: '2.25rem',
  
  // Font Weights
  fontWeightLight: 300,
  fontWeightNormal: 400,
  fontWeightMedium: 500,
  fontWeightSemibold: 600,
  fontWeightBold: 700,
  
  // Line Heights
  lineHeightNone: 1,
  lineHeightTight: 1.25,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.625,
};

// Spacing
export const spacing: Theme['spacing'] = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

// Border Radius
export const borderRadius: Theme['borderRadius'] = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

// Box Shadow
export const boxShadow: Theme['boxShadow'] = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

// Z-Index
export const zIndex: Theme['zIndex'] = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
};

// Assets
export const assets = {
  logo: '/logo/logo.svg',
  logoDark: '/logo/logo-dark.svg',
  logoIcon: '/logo/logo-icon.svg',
  favicon: '/favicon.ico',
};

// Export theme
export const theme: Theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  zIndex,
  assets,
};

export default theme;
