
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
    return { isValid: false, error: 'Student ID is required' };
  }
  
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  if (!alphanumericRegex.test(studentId)) {
    return { isValid: false, error: 'Only letters and numbers allowed' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; error?: string } => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  
  return { isValid: true };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): { isValid: boolean; error?: string } => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true };
};

// Session management
export const getSessionTimeoutWarning = (): string => {
  return 'Session expired, please login again';
};

// Role-based access helpers
export const isTeacherRole = (department: string, shift: string): boolean => {
  return department.toLowerCase() === 'all department' || shift === 'full';
};

export const getDefaultRole = (department: string, shift: string): string => {
  return isTeacherRole(department, shift) ? 'teacher' : 'student';
};
