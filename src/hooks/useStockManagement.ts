import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type StockOperation = 'restock_warehouse' | 'restock_shelf' | 'adjust_shelf_stock' | 'get_stock_status';
export type StockSource = 'Product Inventory' | 'Order Management' | 'Checkout';

interface StockOperationPayload {
  operation: StockOperation;
  productId: string;
  quantity: number;
  source: StockSource;
}

interface StockResponse {
  success: boolean;
  data?: Record<string, unknown>;
  message?: string;
  error?: string;
}

export const useStockManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const executeStockOperation = useCallback(async (payload: StockOperationPayload): Promise<StockResponse> => {
    setIsLoading(true);

    try {
      console.log('Executing stock operation:', payload);

      // Ensure we have a valid session before making the call
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('Session validation failed:', sessionError);
        throw new Error('Authentication required. Please refresh the page and try again.');
      }

      const { data, error } = await supabase.functions.invoke('stock-management', {
        body: payload
      });

      if (error) {
        console.error('Stock management error:', error);

        // If it's a 403 error, try refreshing the session and retry once
        if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
          console.log('403 error detected, attempting to refresh session and retry...');

          toast({
            title: "Refreshing Session",
            description: "Retrying operation with fresh authentication...",
          });

          await supabase.auth.refreshSession();

          // Retry the operation once
          const { data: retryData, error: retryError } = await supabase.functions.invoke('stock-management', {
            body: payload
          });

          if (retryError) {
            throw new Error(retryError.message || 'Stock operation failed after retry');
          }

          if (!retryData.success) {
            console.error('Stock operation failed on retry:', retryData.error);
            throw new Error(retryData.error || 'Stock operation failed after retry');
          }

          if (payload.operation !== 'get_stock_status' && retryData.message) {
            toast({
              title: "Stock Updated",
              description: retryData.message,
            });
          }

          return retryData;
        }

        throw new Error(error.message || 'Stock operation failed');
      }

      if (!data.success) {
        console.error('Stock operation failed:', data.error);
        throw new Error(data.error || 'Stock operation failed');
      }

      if (payload.operation !== 'get_stock_status' && data.message) {
        toast({
          title: "Stock Updated",
          description: data.message,
        });
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Stock operation failed:', errorMessage);

      if (payload.operation !== 'get_stock_status') {
        toast({
          title: "Stock Operation Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Warehouse restocking - can add any amount
  const restockWarehouse = useCallback(async (productId: string, quantity: number, source: StockSource = 'Product Inventory') => {
    if (quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be greater than 0",
        variant: "destructive",
      });
      return { success: false, error: "Invalid quantity" };
    }

    return executeStockOperation({
      operation: 'restock_warehouse',
      productId,
      quantity,
      source
    });
  }, [executeStockOperation, toast]);

  // Shelf restocking - moves stock from warehouse to shelf
  const restockShelf = useCallback(async (productId: string, quantity: number, source: StockSource = 'Product Inventory') => {
    if (quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be greater than 0",
        variant: "destructive",
      });
      return { success: false, error: "Invalid quantity" };
    }

    return executeStockOperation({
      operation: 'restock_shelf',
      productId,
      quantity,
      source
    });
  }, [executeStockOperation, toast]);

  // Shelf stock adjustment - for order operations (can be negative)
  const adjustShelfStock = useCallback(async (productId: string, quantity: number, source: StockSource) => {
    return executeStockOperation({
      operation: 'adjust_shelf_stock',
      productId,
      quantity,
      source
    });
  }, [executeStockOperation]);

  // Get current stock status
  const getStockStatus = useCallback(async (productId: string) => {
    return executeStockOperation({
      operation: 'get_stock_status',
      productId,
      quantity: 0,
      source: 'Product Inventory'
    });
  }, [executeStockOperation]);

  return {
    isLoading,
    restockWarehouse,
    restockShelf,
    adjustShelfStock,
    getStockStatus,
    executeStockOperation
  };
};