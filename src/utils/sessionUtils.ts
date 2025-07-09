
import { supabase } from '@/integrations/supabase/client';
import config from '@/config';

export class SessionUtils {
  static async getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  }

  static async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session;
  }

  static isSessionExpired(expiresAt: number): boolean {
    const now = Date.now() / 1000;
    return expiresAt < now;
  }

  static calculateRefreshTime(expiresAt: number): number {
    const now = Date.now() / 1000;
    return (expiresAt - now - 300) * 1000; // 5 minutes before expiry
  }

  static hasExceededMaxDuration(startTime: number): boolean {
    if (startTime === 0) return false;
    const sessionDuration = Date.now() - startTime;
    // Use SESSION_TIMEOUT from SYSTEM.SECURITY or default to 24 hours if not set
    const sessionTimeout = config.SYSTEM?.SECURITY?.SESSION_TIMEOUT || (24 * 60 * 60 * 1000);
    return sessionDuration > sessionTimeout;
  }
}
