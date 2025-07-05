import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useN8nIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const triggerWebhook = async (webhookUrl: string, data: Record<string, unknown> = {}) => {
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
      console.error("Error triggering n8n webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the n8n workflow. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    triggerWebhook,
    isLoading,
  };
};
