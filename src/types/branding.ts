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
  performance: unknown;
  security: unknown;
  iso_compliance: unknown;
}

export interface ConfigJSON {
  app: AppConfig & { welcome_points: number };
  forms: FormsConfig;
  system: SystemConfig;
}

export interface MessagesJSON {
  errors?: Record<string, string>;
  auth?: Record<string, string>;
  [key: string]: unknown;
}
