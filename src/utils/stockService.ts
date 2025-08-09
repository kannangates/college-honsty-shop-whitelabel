
import { supabase } from '@/integrations/supabase/client';

type OrderAction = 'reduce' | 'restore';

export interface AdjustResult {
  id: string;
  shelf_stock?: number;
  warehouse_stock?: number;
  opening_stock?: number;
  updated_at?: string;
}

export const stockService = {
  // True restock: increments warehouse_stock (and opening_stock)
  async restockWarehouse(productId: string, quantity: number): Promise<AdjustResult | null> {
    console.log('🧰 stockService.restockWarehouse ->', { productId, quantity });
    if (!productId || quantity <= 0) {
      throw new Error('Invalid product id or quantity');
    }

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? null;

    const { data, error } = await supabase.rpc('adjust_product_stock', {
      p_product_id: productId,
      p_delta_shelf: 0,
      p_delta_warehouse: quantity,
      p_reason: 'warehouse_restock',
      p_order_id: null,
      p_actor_user_id: userId,
      p_adjust_opening: true
    });

    if (error) {
      console.error('❌ restockWarehouse RPC error:', error);
      throw error;
    }

    const row = Array.isArray(data) ? data[0] : null;
    console.log('✅ restockWarehouse updated:', row);
    return row as AdjustResult | null;
  },

  // Move stock from warehouse to shelf (no opening change)
  async moveWarehouseToShelf(productId: string, quantity: number): Promise<AdjustResult | null> {
    console.log('🧰 stockService.moveWarehouseToShelf ->', { productId, quantity });
    if (!productId || quantity <= 0) {
      throw new Error('Invalid product id or quantity');
    }

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? null;

    const { data, error } = await supabase.rpc('adjust_product_stock', {
      p_product_id: productId,
      p_delta_shelf: quantity,
      p_delta_warehouse: -quantity,
      p_reason: 'warehouse_to_shelf',
      p_order_id: null,
      p_actor_user_id: userId,
      p_adjust_opening: false
    });

    if (error) {
      console.error('❌ moveWarehouseToShelf RPC error:', error);
      // Surface a clear message for insufficient stock if raised by function
      throw error;
    }

    const row = Array.isArray(data) ? data[0] : null;
    console.log('✅ moveWarehouseToShelf updated:', row);
    return row as AdjustResult | null;
  },

  // Order-based reduce/restore across all items in the order
  async applyOrderStockChange(orderId: string, action: OrderAction) {
    console.log('🧰 stockService.applyOrderStockChange ->', { orderId, action });
    if (!orderId || (action !== 'reduce' && action !== 'restore')) {
      throw new Error('Invalid order id or action');
    }

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? null;

    const { data, error } = await supabase.rpc('apply_order_stock_change', {
      p_order_id: orderId,
      p_action: action,
      p_actor_user_id: userId
    });

    if (error) {
      console.error('❌ applyOrderStockChange RPC error:', error);
      throw error;
    }

    console.log('✅ applyOrderStockChange result:', data);
    return data;
  }
};
