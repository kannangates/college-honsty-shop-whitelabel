declare module '../whitelabel.json' {
  interface Messages {
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
        [key: string]: string;
      };
      emailNotSent?: string;
      passwordResetSent?: string;
    };
    errors: {
      network_error?: string;
      [key: string]: string | undefined;
    };
    navigation?: Record<string, string>;
    products?: Record<string, string>;
    system?: Record<string, unknown>;
    defaultError?: string;
    [key: string]: unknown;
  }

  interface WhitelabelConfig {
    app: {
      name: string;
      welcome_points: number;
      tagline: string;
      subtitle: string;
      description: string;
      payment?: {
        experience?: 'static_qr' | 'dynamic_qr';
        upi?: {
          vpa?: string;
          payee_name?: string;
          note_prefix?: string;
        };
        qr?: {
          fallback_image?: string;
        };
      };
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
    messages: Messages;
  };

  const config: WhitelabelConfig;
  export default config;
}
