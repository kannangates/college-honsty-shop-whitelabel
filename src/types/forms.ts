// Form types to avoid conflicts with database types
export interface SignupFormData {
  studentId: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  role: string;
  shift: string;
}

export interface LoginFormData {
  studentId: string;
  password: string;
} 