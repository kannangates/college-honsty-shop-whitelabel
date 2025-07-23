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