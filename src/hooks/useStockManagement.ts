import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { stockService } from '@/utils/stockService';

export const useStockManagement = () => {
  const { toast } = useToast();

  const restoreStock = async (orderId: string) => {
    try {
      console.log('📦 Restoring stock for cancelled order via RPC:', orderId);
      
      await stockService.applyOrderStockChange(orderId, 'restore');

      toast({
        title: 'Stock Restored',
        description: 'Product quantities have been restored to shelf stock.',
      });

    } catch (error) {
      console.error('Error restoring stock (RPC):', error);
      toast({
        title: 'Error',
        description: 'Failed to restore stock quantities',
        variant: 'destructive',
      });
    }
  };

  const reduceStock = async (orderId: string) => {
    try {
      console.log('📦 Reducing stock for order via RPC:', orderId);
      
      await stockService.applyOrderStockChange(orderId, 'reduce');

      // No toast here originally; keep behavior minimal
    } catch (error) {
      console.error('Error reducing stock (RPC):', error);
    }
  };

  return {
    restoreStock,
    reduceStock
  };
};
