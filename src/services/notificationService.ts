import { toast } from 'sonner';
import { WHITELABEL_CONFIG } from '@/config';

type ApiError = Error & {
  status?: number;
  message: string;
  code?: string;
};

export class NotificationService {
  static showSuccess(message: string) {
    toast.success(message);
  }

  static showError(message: string) {
    toast.error(message || WHITELABEL_CONFIG.messages?.errors?.network_error || 'An error occurred');
  }

  static showInfo(message: string) {
    toast.info(message);
  }

  static showWarning(message: string) {
    toast.warning(message);
  }

  static handleApiError(error: unknown, context: string = 'operation'): void {
    console.error(`[${context} Error]:`, error);
    
    if (!(error instanceof Error)) {
      this.showError('An unexpected error occurred');
      return;
    }

    const errorMessage = error.message || 'An unexpected error occurred';
    
    // Handle Supabase errors
    if (errorMessage.includes('email not confirmed') || errorMessage.includes('Email not confirmed')) {
      this.showError('Please confirm your email before signing in');
      return;
    }
    
    if (errorMessage.includes('Invalid login credentials')) {
      this.showError('Invalid email or password');
      return;
    }
    
    // Handle network errors
    if ('code' in error && (error.code === 'ERR_NETWORK' || errorMessage.includes('Network Error'))) {
      this.showError(WHITELABEL_CONFIG.messages?.errors?.network_error || 'Network error. Please check your connection.');
      return;
    }
    
    // Default error message
    this.showError(errorMessage);
  }

  static handleEmailError(error: unknown, context: string): void {
    console.error(`[Email Error in ${context}]:`, error);
    
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      
      // Check if it's a rate limiting error
      if (errorObj.status === 429) {
        this.showError('Too many attempts. Please try again later.');
        return;
      }
      
      // Check if it's a configuration error
      if (typeof errorObj.message === 'string' && 
          errorObj.message.includes('Email provider not configured')) {
        this.showError('Email service is not properly configured. Please contact support.');
        return;
      }
    }
    
    // Default email error
    const defaultMessage = WHITELABEL_CONFIG.messages?.errors?.network_error || 
                         'Failed to send email. Please try again later.';
    this.showError(defaultMessage);
  }
}
