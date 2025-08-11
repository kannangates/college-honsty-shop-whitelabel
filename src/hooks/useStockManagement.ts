import { useState } from 'react';
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
  data?: any;
  message?: string;
  error?: string;
}

export const useStockManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const executeStockOperation = async (payload: StockOperationPayload): Promise<StockResponse> => {
    setIsLoading(true);
    
    try {
      console.log('Executing stock operation:', payload);
      
      const { data, error } = await supabase.functions.invoke('stock-management', {
        body: payload
      });

      if (error) {
        throw new Error(error.message || 'Stock operation failed');
      }

      if (!data.success) {
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
  };

  // Warehouse restocking - can add any amount
  const restockWarehouse = async (productId: string, quantity: number, source: StockSource = 'Product Inventory') => {
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
  };

  // Shelf restocking - moves stock from warehouse to shelf
  const restockShelf = async (productId: string, quantity: number, source: StockSource = 'Product Inventory') => {
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
  };

  // Shelf stock adjustment - for order operations (can be negative)
  const adjustShelfStock = async (productId: string, quantity: number, source: StockSource) => {
    return executeStockOperation({
      operation: 'adjust_shelf_stock',
      productId,
      quantity,
      source
    });
  };

  // Get current stock status
  const getStockStatus = async (productId: string) => {
    return executeStockOperation({
      operation: 'get_stock_status',
      productId,
      quantity: 0,
      source: 'Product Inventory'
    });
  };

  return {
    isLoading,
    restockWarehouse,
    restockShelf,
    adjustShelfStock,
    getStockStatus,
    executeStockOperation
  };
};