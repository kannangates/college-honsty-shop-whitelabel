
import { CONFIG } from '@/config';

// Backdoor authentication for development/testing
export const BACKDOOR_USERNAME = import.meta.env.VITE_BACKDOOR_USERNAME || '';
export const BACKDOOR_PASSWORD = import.meta.env.VITE_BACKDOOR_PASSWORD || '';
export const isBackdoorEnabled =
  import.meta.env.VITE_BACKDOOR_ENABLED === 'true' &&
  BACKDOOR_USERNAME !== '' &&
  BACKDOOR_PASSWORD !== '';

// Auth validation helpers
export const validateStudentId = (studentId: string): { isValid: boolean; error?: string } => {
  if (!studentId) {
    return { isValid: false, error: CONFIG.MESSAGES.ERRORS.MISSING_STUDENT_ID };
  }
  
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  if (!alphanumericRegex.test(studentId)) {
    return { isValid: false, error: CONFIG.MESSAGES.ERRORS.STUDENT_ID_ALPHANUMERIC };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: CONFIG.MESSAGES.ERRORS.MISSING_CREDENTIALS };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: CONFIG.MESSAGES.ERRORS.PASSWORD_MIN_LENGTH };
  }
  
  return { isValid: true };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): { isValid: boolean; error?: string } => {
  if (password !== confirmPassword) {
    return { isValid: false, error: CONFIG.MESSAGES.ERRORS.ENSURE_PASSWORDS_MATCH };
  }
  
  return { isValid: true };
};

// Session management
export const getSessionTimeoutWarning = (): string => {
  return CONFIG.MESSAGES.ERRORS.SESSION_EXPIRED;
};

// Role-based access helpers
export const isTeacherRole = (department: string, shift: string): boolean => {
  return department.toLowerCase() === 'all department' || shift === 'full';
};

export const getDefaultRole = (department: string, shift: string): string => {
  return isTeacherRole(department, shift) ? 'teacher' : 'student';
};
