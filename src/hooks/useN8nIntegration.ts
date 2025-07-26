import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface N8nIntegrationReturn {
  triggerWebhook: (webhookUrl: string, data?: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
  testWebhook: (webhookUrl: string) => Promise<{ success: boolean; error?: string }>;
}

export const useN8nIntegration = (): N8nIntegrationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const triggerWebhook = useCallback(async (webhookUrl: string, data: Record<string, unknown> = {}): Promise<void> => {
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please provide a valid n8n webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Triggering n8n webhook:", webhookUrl);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          ...data,
        }),
      });

      toast({
        title: "Workflow Triggered",
        description: "The n8n workflow has been triggered successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error("Error triggering n8n webhook:", errorMessage);
      toast({
        title: "Error",
        description: `Failed to trigger the n8n workflow: ${errorMessage}. Please check the URL and try again.`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const testWebhook = useCallback(async (webhookUrl: string): Promise<{ success: boolean; error?: string }> => {
    if (!webhookUrl) {
      return { success: false, error: 'Webhook URL is required' };
    }

    setIsLoading(true);
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          test: true, 
          type: 'test',
          timestamp: new Date().toISOString() 
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error testing webhook:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    triggerWebhook,
    isLoading,
    testWebhook,
  };
};
