
import { supabase } from '@/integrations/supabase/client';
import { SYSTEM_CONFIG } from '@/config';

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
    return sessionDuration > SYSTEM_CONFIG.PERFORMANCE.session_timeout;
  }
}
