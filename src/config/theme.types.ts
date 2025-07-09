export interface ThemeColors {
  // Primary Colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Secondary Colors
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Accent Colors
  accent: string;
  accentLight: string;
  accentDark: string;
  
  // Status Colors
  success: string;
  warning: string;
  danger: string;
  info: string;
  
  // Grayscale
  white: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray800: string;
  gray900: string;
  black: string;
  
  // Backgrounds
  background: string;
  surface: string;
  
  // Text
  text: string;
  textSecondary: string;
  textDisabled: string;
  
  // Borders
  border: string;
  borderLight: string;
  borderDark: string;
  
  [key: string]: string; // Allow additional color properties
}

export interface Typography {
  fontFamily: string;
  fontFamilyMono: string;
  fontSizeBase: string;
  fontSizeXs: string;
  fontSizeSm: string;
  fontSizeMd: string;
  fontSizeLg: string;
  fontSizeXl: string;
  fontSize2xl: string;
  fontSize3xl: string;
  fontSize4xl: string;
  fontWeightLight: number;
  fontWeightNormal: number;
  fontWeightMedium: number;
  fontWeightSemibold: number;
  fontWeightBold: number;
  lineHeightNone: number;
  lineHeightTight: number;
  lineHeightNormal: number;
  lineHeightRelaxed: number;
}

export interface Spacing {
  [key: string]: string;
}

export interface BorderRadius {
  [key: string]: string;
}

export interface BoxShadow {
  [key: string]: string;
}

export interface ZIndex {
  [key: string]: string;
}

export interface ThemeFeatures {
  darkMode?: boolean;
  notifications?: boolean;
  analytics?: boolean;
  payments?: boolean;
  [key: string]: boolean | string | number | undefined;
}

export interface Breakpoints {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
  [key: string]: string | undefined;
}

export interface Theme {
  colors: ThemeColors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  boxShadow: BoxShadow;
  zIndex: ZIndex;
  breakpoints?: Breakpoints;
  assets?: {
    logo?: string;
    logoDark?: string;
    logoIcon?: string;
    favicon?: string;
    [key: string]: string | undefined;
  };
  features?: ThemeFeatures;
  meta?: {
    keywords?: string;
    twitterHandle?: string;
    [key: string]: string | undefined;
  };
}
