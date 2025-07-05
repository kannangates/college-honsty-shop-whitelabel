
import { supabase } from '@/integrations/supabase/client';

export interface CaptchaConfig {
  siteKey: string;
  secretKey: string;
  enabled: boolean;
}

export class CaptchaManager {
  private static instance: CaptchaManager;
  private config: CaptchaConfig | null = null;

  static getInstance(): CaptchaManager {
    if (!CaptchaManager.instance) {
      CaptchaManager.instance = new CaptchaManager();
    }
    return CaptchaManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      // For now, disable captcha as integration settings table structure needs to be updated
      this.config = { 
        siteKey: '', 
        secretKey: '', 
        enabled: false 
      };
    } catch (error) {
      console.error('Failed to load captcha configuration:', error);
      this.config = { siteKey: '', secretKey: '', enabled: false };
    }
  }

  loadHCaptchaScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('hcaptcha-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'hcaptcha-script';
      script.src = 'https://cdn.jsdelivr.net/npm/hcaptcha@1.8.1/dist/hcaptcha.min.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load hCaptcha script'));
      
      document.head.appendChild(script);
    });
  }

  async renderCaptcha(elementId: string, callback: (token: string) => void): Promise<void> {
    if (!this.config?.enabled || !this.config.siteKey) return;

    try {
      await this.loadHCaptchaScript();
      
      // Wait for hcaptcha to be available
      const hcaptcha = (window as any).hcaptcha;
      if (!hcaptcha) throw new Error('hCaptcha not loaded');

      hcaptcha.render(elementId, {
        sitekey: this.config.siteKey,
        callback: callback,
        'error-callback': () => {
          console.error('hCaptcha error');
        }
      });
    } catch (error) {
      console.error('Failed to render captcha:', error);
    }
  }

  async verifyCaptcha(token: string): Promise<boolean> {
    if (!this.config?.enabled || !token) return true;

    try {
      const { data } = await supabase.functions.invoke('verify-captcha', {
        body: { token, secretKey: this.config.secretKey }
      });

      return data?.success || false;
    } catch (error) {
      console.error('Captcha verification failed:', error);
      return false;
    }
  }

  isEnabled(): boolean {
    return this.config?.enabled || false;
  }

  getSiteKey(): string {
    return this.config?.siteKey || '';
  }
}
