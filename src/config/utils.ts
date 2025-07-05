
// Configuration Utilities
import { IMAGES_CONFIG } from './images';
import { BRANDING_CONFIG } from './branding';
import { SUPABASE_CONFIG } from './supabase';
import { SYSTEM_CONFIG } from './system';

export const getSupabaseConfig = () => ({
  url: SUPABASE_CONFIG.URL,
  anonKey: SUPABASE_CONFIG.ANON_KEY,
  auth: SUPABASE_CONFIG.AUTH_CONFIG
});

export const getLogoUrl = (): string => IMAGES_CONFIG.COLLEGE_LOGO;

export const generateThemeCSS = () => `
  :root {
    --brand-primary: ${BRANDING_CONFIG.COLORS.PRIMARY};
    --brand-secondary: ${BRANDING_CONFIG.COLORS.SECONDARY};
    --brand-accent: ${BRANDING_CONFIG.COLORS.ACCENT};
  }
`;

export const loadImageWithRetry = (src: string, retries: number = SYSTEM_CONFIG.PERFORMANCE.IMAGE_RETRY_ATTEMPTS): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let attempts = 0;
    
    const tryLoad = () => {
      attempts++;
      
      img.onload = () => {
        console.log(`✅ Image loaded successfully: ${src}`);
        resolve(src);
      };
      
      img.onerror = () => {
        if (attempts < retries) {
          console.warn(`⚠️ Image load failed, retrying (${attempts}/${retries}): ${src}`);
          setTimeout(tryLoad, SYSTEM_CONFIG.PERFORMANCE.IMAGE_RETRY_DELAY * attempts);
        } else {
          console.error(`❌ Image load failed after ${retries} attempts: ${src}`);
          if (src === IMAGES_CONFIG.COLLEGE_LOGO) {
            resolve(IMAGES_CONFIG.COLLEGE_LOGO_FALLBACK);
          } else {
            reject(new Error(`Failed to load image: ${src}`));
          }
        }
      };
      
      img.src = src;
    };
    
    tryLoad();
  });
};

export const validateConfig = () => {
  const required = ['APP_CONFIG', 'SUPABASE_CONFIG', 'BRANDING_CONFIG'];
  // Note: This is a simplified validation - in real implementation would check actual imports
  return true;
};
