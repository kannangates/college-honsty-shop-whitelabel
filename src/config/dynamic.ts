
import { FORMS_CONFIG } from './forms';

// Dynamic configuration that can be loaded from branding files
let currentTheme = {
  name: 'Shasun Engineering College',
  logo: {
    url: '/logo.png',
    fallback: '/logo.png'
  },
  portal_name: 'Honesty Shop',
  tagline: 'Your trusted college marketplace',
  subtitle: 'Shop with confidence',
  description: 'A secure marketplace for college students',
  colors: {
    primary: '#202072',
    secondary: '#e66166',
    accent: '#f5f1f4'
  },
  favicon: '/logo.png'
};

let currentConfig = {
  app: {
    name: 'Honesty Shop',
    welcome_points: 100
  },
  forms: {
    labels: {
      student_id: 'Student ID',
      full_name: 'Full Name',
      email: 'Email',
      password: 'Password',
      confirm_password: 'Confirm Password',
      mobile_number: 'Mobile Number',
      department: 'Department',
      shift: 'Shift',
      role: 'Role'
    },
    placeholders: {
      student_id: 'Enter your Student ID',
      full_name: 'Enter your full name',
      email: 'Enter your email',
      password: 'Enter your password',
      confirm_password: 'Confirm your password',
      mobile_number: 'Enter your mobile number'
    },
    shift_options: FORMS_CONFIG.SHIFT_OPTIONS,
    role_options: FORMS_CONFIG.ROLE_OPTIONS
  },
  system: {
    performance: {
      CACHE_TIMEOUT: 30000,
      ENABLE_CACHING: true
    },
    security: {
      SESSION_TIMEOUT: 3600000,
      SESSION_VALIDATION_INTERVAL: 300000,
      ENABLE_SECURITY_MONITORING: true
    },
    iso_compliance: {
      ENABLE_AUDIT_LOGGING: true,
      ENABLE_PERFORMANCE_MONITORING: true
    }
  }
};

let currentMessages = {
  auth: {
    login_description: 'Sign in to continue your journey',
    login_button: 'Sign In'
  },
  navigation: {
    header_title: 'Honesty Shop',
    notifications: 'Notifications'
  },
  products: {
    no_products: 'No products available',
    loading_products: 'Loading products...',
    out_of_stock: 'Out of Stock',
    add_to_cart: 'Add to Cart',
    check_back: 'Check back later for new products'
  },
  loading: {
    signing_in: 'Signing in...',
    loading_image: 'Loading image...',
    loading_products: 'Loading products...'
  },
  errors: {
    missing_credentials: 'Missing Fields',
    fill_all_fields: 'Please fill in all required fields',
    login_failed: 'Login failed',
    all_fields_required: 'All fields required',
    student_id_alphanumeric: 'Only letters and numbers allowed',
    missing_student_id: 'Student ID is required',
    password_min_length: 'Password must be at least 6 characters',
    ensure_passwords_match: 'Please ensure passwords match',
    session_expired: 'Session expired, please login again'
  },
  success: {
    password_reset_sent: 'Password reset link sent'
  }
};

export const getCurrentTheme = () => currentTheme;
export const getCurrentConfig = () => currentConfig;
export const getCurrentMessages = () => currentMessages;

export const getBrandingConfig = async () => {
  return Promise.resolve({
    theme: currentTheme,
    config: currentConfig,
    messages: currentMessages
  });
};
