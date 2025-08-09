
import { stockService } from './stockService';

export interface ShelfStockEntry {
  product_id: string;
  quantity: number;
  timestamp: string;
  current_warehouse_stock: number;
  current_shelf_stock: number;
  new_warehouse_stock: number;
  new_shelf_stock: number;
}

export const moveToShelfStock = async (
  productId: string,
  quantity: number
): Promise<void> => {
  console.log('📦 Moving stock from warehouse to shelf (via RPC):', { productId, quantity });

  try {
    const res = await stockService.moveWarehouseToShelf(productId, quantity);
    if (!res) {
      console.warn('⚠️ Shelf move returned no data (possible RLS or missing product).', { productId });
      throw new Error('Not authorized to update product or product not found');
    }
    console.log('✅ Stock moved to shelf successfully (RPC):', res);
  } catch (error: any) {
    console.error('❌ Shelf stock operation failed (RPC):', error);
    // Preserve friendly error messaging for insufficient stock if surfaced
    if (error?.message?.toLowerCase().includes('insufficient warehouse stock')) {
      throw new Error(`Cannot move ${quantity} units to shelf. Insufficient warehouse stock.`);
    }
    throw error;
  }
};
