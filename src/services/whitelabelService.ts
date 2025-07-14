import { supabase } from '@/integrations/supabase/client';

export interface WhitelabelConfig {
  app: {
    name: string;
    welcome_points: number;
    tagline: string;
    subtitle: string;
    description: string;
  };
  branding: {
    college_name: string;
    portal_name: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    logo: {
      url: string;
      fallback: string;
    };
    favicon: string;
  };
  forms: {
    labels: {
      student_id: string;
      full_name: string;
      email: string;
      password: string;
      confirm_password: string;
      mobile_number: string;
      department: string;
      shift: string;
      role: string;
      welcome_points: string;
    };
    placeholders: {
      student_id: string;
      full_name: string;
      email: string;
      password: string;
      confirm_password: string;
      mobile_number: string;
    };
    shift_options: Array<{ value: string; label: string }>;
    role_options: Array<{ value: string; label: string }>;
  };
  messages: {
    auth: {
      login_description: string;
      signup_description: string;
      login_button: string;
      signup_button: string;
      welcome_back: string;
      account_created: string;
      sign_in_success: string;
      fill_all_fields: string;
      errors: {
        missing_student_id: string;
        student_id_alphanumeric: string;
        missing_credentials: string;
        password_min_length: string;
        ensure_passwords_match: string;
        session_expired: string;
        login_failed: string;
      };
    };
    navigation: {
      header_title: string;
      notifications: string;
      no_notifications: string;
    };
    products: {
      no_products: string;
      out_of_stock: string;
      add_to_cart: string;
      total: string;
      check_back: string;
      loading_products: string;
    };
    errors: {
      all_fields_required: string;
      fill_all_fields: string;
      passwords_dont_match: string;
      password_too_short: string;
      missing_credentials: string;
      login_failed: string;
      signup_failed: string;
      student_id_alphanumeric: string;
      student_id_not_found: string;
      session_expired: string;
      network_error: string;
      missing_student_id: string;
      password_min_length: string;
      ensure_passwords_match: string;
      failed_to_load_image: string;
      failedToLoadStockOperations: string;
      failedToSaveStockOperations: string;
    };
    loading: {
      signing_in: string;
      creating_account: string;
      loading_products: string;
      loading_image: string;
    };
    success: {
      password_reset_sent: string;
      reset_link_sent: string;
    };
  };
  system: {
    performance: {
      cache_timeout: number;
      max_login_attempts: number;
      session_timeout: number;
      image_retry_attempts: number;
      image_retry_delay: number;
    };
    security: {
      enable_csrf_protection: boolean;
      enable_xss_protection: boolean;
      enable_rate_limiting: boolean;
      session_validation_interval: number;
      audit_log_retention: number;
    };
    iso_compliance: {
      enable_audit_logging: boolean;
      enable_performance_monitoring: boolean;
      enable_security_monitoring: boolean;
      enable_quality_assurance: boolean;
      compliance_check_interval: number;
    };
  };
  SECURITY: {
    session_validation_interval: number;
  };
  badge_images: {
    achievement_badge: string;
    honor_badge: string;
    excellence_badge: string;
  };
  admin: {
    access_note: string;
  };
}

class WhitelabelService {
  async getConfig(): Promise<WhitelabelConfig> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`https://vkuagjkrpbagrchsqmsf.supabase.co/functions/v1/whitelabel-config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching whitelabel config:', error);
      throw error;
    }
  }

  async updateConfig(config: WhitelabelConfig): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`https://vkuagjkrpbagrchsqmsf.supabase.co/functions/v1/whitelabel-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update config: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating whitelabel config:', error);
      throw error;
    }
  }
}

export const whitelabelService = new WhitelabelService(); 