
import { WHITELABEL_CONFIG } from '@/config';

// Backdoor authentication for development/testing
export const BACKDOOR_USERNAME = import.meta.env.VITE_BACKDOOR_USERNAME || '';
export const BACKDOOR_PASSWORD = import.meta.env.VITE_BACKDOOR_PASSWORD || '';
export const isBackdoorEnabled =
  import.meta.env.VITE_BACKDOOR_ENABLED === 'true' &&
  BACKDOOR_USERNAME !== '' &&
  BACKDOOR_PASSWORD !== '';

export function getBackdoorUser() {
  return {
    id: 'backdoor',
    name: 'Backdoor User',
    email: 'backdoor@honesty.shop',
    role: 'admin',
    department: 'all',
    points: 9999,
    is_active: true,
    created_at: new Date().toISOString(),
  };
}

export function getBackdoorMessages() {
  return WHITELABEL_CONFIG.messages.auth;
}

export function getBackdoorWelcomeMessage() {
  const messages = WHITELABEL_CONFIG.messages.auth;
  return messages?.welcome_back || 'Welcome back!';
}

export function getBackdoorErrorMessage() {
  const messages = WHITELABEL_CONFIG.messages.errors;
  return messages?.login_failed || 'Login failed';
}

// Auth validation helpers
export const validateStudentId = (studentId: string): { isValid: boolean; error?: string } => {
  const messages = WHITELABEL_CONFIG.messages.auth;
  
  if (!studentId) {
    return { isValid: false, error: messages.errors?.missing_student_id || 'Student ID is required' };
  }
  
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  if (!alphanumericRegex.test(studentId)) {
    return { isValid: false, error: messages.errors?.student_id_alphanumeric || 'Only letters and numbers allowed' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  const messages = WHITELABEL_CONFIG.messages.auth;
  
  if (!password) {
    return { isValid: false, error: messages.errors?.missing_credentials || 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: messages.errors?.password_min_length || 'Password must be at least 6 characters' };
  }
  
  return { isValid: true };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): { isValid: boolean; error?: string } => {
  const messages = WHITELABEL_CONFIG.messages.auth;
  
  if (password !== confirmPassword) {
    return { isValid: false, error: messages.errors?.ensure_passwords_match || 'Passwords do not match' };
  }
  
  return { isValid: true };
};

// Session management
export const getSessionTimeoutWarning = (): string => {
  const messages = WHITELABEL_CONFIG.messages.auth;
  return messages.errors?.session_expired || 'Session expired, please login again';
};

// Role-based access helpers
export const isTeacherRole = (department: string, shift: string): boolean => {
  return department.toLowerCase() === 'all department' || shift === 'full';
};

export const getDefaultRole = (department: string, shift: string): string => {
  return isTeacherRole(department, shift) ? 'teacher' : 'student';
};
