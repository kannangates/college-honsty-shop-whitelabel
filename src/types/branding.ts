export interface ThemeJSON {
  tagline: string;
  subtitle: string;
  description: string;
  name: string;
  portal_name: string;
  colors: Record<string, string>;
  logo: {
    url: string;
    fallback: string;
  };
  favicon: string;
}

export interface FormsConfig {
  labels?: Record<string, string>;
  placeholders?: Record<string, string>;
}

export interface AppConfig {
  name: string;
  welcome_points: number;
}

export interface SystemConfig {
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
}

export interface ConfigJSON {
  app: AppConfig & { welcome_points: number };
  forms: FormsConfig;
  system: SystemConfig;
}

export interface MessagesJSON {
  errors?: Record<string, string>;
  auth?: Record<string, string>;
  navigation?: Record<string, string>;
  products?: Record<string, string>;
  loading?: {
    loading_image?: string;
    loading_products?: string;
    [key: string]: string | undefined;
  };
  success?: Record<string, string>;
  [key: string]: unknown;
}
