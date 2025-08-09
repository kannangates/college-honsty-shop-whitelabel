
import { stockService } from './stockService';

export interface WarehouseStockEntry {
  product_id: string;
  quantity: number;
  timestamp: string;
  current_stock: number;
  new_stock: number;
}

export const addWarehouseStock = async (
  productId: string,
  quantity: number
): Promise<void> => {
  console.log('📦 Adding warehouse stock (via RPC):', { productId, quantity });

  try {
    const res = await stockService.restockWarehouse(productId, quantity);
    if (!res) {
      console.warn('⚠️ Warehouse restock returned no data (possible RLS or missing product).', { productId });
      throw new Error('Not authorized to update product or product not found');
    }
    console.log('✅ Warehouse stock added successfully (RPC):', res);
  } catch (error) {
    console.error('❌ Warehouse stock operation failed (RPC):', error);
    throw error;
  }
};
