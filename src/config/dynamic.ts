
import { FORMS_CONFIG } from './forms';

// Dynamic configuration that can be loaded from branding files
let currentTheme = {
  logo: {
    url: '/logo.png',
    fallback: '/logo.png'
  },
  portal_name: 'Honesty Shop',
  tagline: 'Your trusted college marketplace',
  subtitle: 'Shop with confidence'
};

let currentConfig = {
  app: {
    welcome_points: 100
  },
  forms: {
    labels: FORMS_CONFIG.LABELS,
    placeholders: FORMS_CONFIG.PLACEHOLDERS,
    shift_options: FORMS_CONFIG.SHIFT_OPTIONS,
    role_options: FORMS_CONFIG.ROLE_OPTIONS
  }
};

let currentMessages = {
  auth: {
    login_description: 'Sign in to continue your journey',
    login_button: 'Sign In'
  },
  loading: {
    signing_in: 'Signing in...'
  },
  errors: {
    missing_credentials: 'Missing Fields',
    fill_all_fields: 'Please fill in all required fields',
    login_failed: 'Login failed',
    all_fields_required: 'All fields required',
    student_id_alphanumeric: 'Only letters and numbers allowed'
  }
};

export const getCurrentTheme = () => currentTheme;
export const getCurrentConfig = () => currentConfig;
export const getCurrentMessages = () => currentMessages;

export const getBrandingConfig = async () => {
  // For now, return the default config
  // In the future, this would load from branding files
  return Promise.resolve({
    theme: currentTheme,
    config: currentConfig,
    messages: currentMessages
  });
};
