
import { WHITELABEL_CONFIG } from '@/config';

// Auth validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


export function getAuthMessages() {
  return WHITELABEL_CONFIG.messages.auth;
}

export function getWelcomeMessage() {
  const messages = WHITELABEL_CONFIG.messages.auth;
  return messages?.welcome_back || 'Welcome back!';
}

export function getErrorMessage() {
  const messages = WHITELABEL_CONFIG.messages.errors;
  return messages?.login_failed || 'Login failed';
}
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
