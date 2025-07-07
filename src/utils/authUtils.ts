
import { getCurrentConfig, getCurrentMessages } from '@/config/dynamic';

// Backdoor authentication for development/testing
export const BACKDOOR_USERNAME = import.meta.env.VITE_BACKDOOR_USERNAME || '';
export const BACKDOOR_PASSWORD = import.meta.env.VITE_BACKDOOR_PASSWORD || '';
export const isBackdoorEnabled =
  import.meta.env.VITE_BACKDOOR_ENABLED === 'true' &&
  BACKDOOR_USERNAME !== '' &&
  BACKDOOR_PASSWORD !== '';

// Auth validation helpers
export const validateStudentId = (studentId: string): { isValid: boolean; error?: string } => {
  const messages = getCurrentMessages();
  
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
  const messages = getCurrentMessages();
  
  if (!password) {
    return { isValid: false, error: messages.errors?.missing_credentials || 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: messages.errors?.password_min_length || 'Password must be at least 6 characters' };
  }
  
  return { isValid: true };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): { isValid: boolean; error?: string } => {
  const messages = getCurrentMessages();
  
  if (password !== confirmPassword) {
    return { isValid: false, error: messages.errors?.ensure_passwords_match || 'Passwords do not match' };
  }
  
  return { isValid: true };
};

// Session management
export const getSessionTimeoutWarning = (): string => {
  const messages = getCurrentMessages();
  return messages.errors?.session_expired || 'Session expired, please login again';
};

// Role-based access helpers
export const isTeacherRole = (department: string, shift: string): boolean => {
  return department.toLowerCase() === 'all department' || shift === 'full';
};

export const getDefaultRole = (department: string, shift: string): string => {
  return isTeacherRole(department, shift) ? 'teacher' : 'student';
};
