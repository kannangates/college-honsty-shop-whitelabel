import { supabase } from '@/integrations/supabase/client';
import { NotificationService } from './notificationService';

export class EmailService {
  /**
   * Sends a test email to the specified address
   * @param email The email address to send the test email to
   * @param subject Optional subject for the test email
   * @param message Optional message for the test email
   */
  static async sendTestEmail(
    email: string,
    subject: string = 'Test Email from College Honesty Shop',
    message: string = 'This is a test email to verify that your email service is working correctly.'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        NotificationService.showError('Please enter a valid email address');
        return { success: false, error: 'Invalid email format' };
      }

      console.log('Sending test email to:', email);
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject,
          text: message,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4f46e5;">${subject}</h2>
              <p>${message}</p>
              <p style="margin-top: 20px; color: #6b7280; font-size: 0.875rem;">
                This is a test email sent from the College Honesty Shop admin panel.
              </p>
            </div>
          `
        }
      });

      if (error) {
        console.error('Error sending test email:', error);
        throw error;
      }

      console.log('Test email sent successfully:', data);
      NotificationService.showSuccess('Test email sent successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error in sendTestEmail:', error);
      NotificationService.handleEmailError(error, 'test_email');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send test email' 
      };
    }
  }
}
