import { supabase } from '@/integrations/supabase/client';
import { addWarehouseStock } from './warehouseStock';
import { moveToShelfStock } from './shelfStock';

export interface RestockEntry {
  product_id: string;
  warehouse_stock: number;
  shelf_stock: number;
  restock_type: 'warehouse' | 'shelf';
  quantity: number;
  timestamp: string;
}

export const handleRestockOperation = async (
  productId: string, 
  quantity: number, 
  restockType: 'warehouse' | 'shelf'
): Promise<void> => {
  console.log('🔄 Starting restock operation:', { productId, quantity, restockType });

  try {
    if (restockType === 'warehouse') {
      await addWarehouseStock(productId, quantity);
    } else if (restockType === 'shelf') {
      await moveToShelfStock(productId, quantity);
    }

    console.log('✅ Restock operation completed successfully');

  } catch (error) {
    console.error('❌ Restock operation failed:', error);
    throw error;
  }
};
