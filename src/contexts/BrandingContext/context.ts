import { createContext } from 'react';
import { BrandingContextType } from './types';
import { theme } from '@/config/theme';

// Create the context with a default value
export const BrandingContext = createContext<BrandingContextType>({
  theme: theme,
  isDarkMode: false,
  toggleDarkMode: () => {},
});
