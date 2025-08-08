
import { supabase } from '@/integrations/supabase/client';

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
  console.log('📦 Adding warehouse stock:', { productId, quantity });

  try {
    // Get current product stock levels
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('warehouse_stock, opening_stock')
      .eq('id', productId)
      .single();

    if (productError) throw productError;
    if (!product) throw new Error('Product not found');

    console.log('📦 Current warehouse stock:', product.warehouse_stock);

    // Calculate new stock levels
    const newWarehouseStock = product.warehouse_stock + quantity;
    const newOpeningStock = product.opening_stock + quantity;

    console.log('📊 New warehouse stock levels:', {
      warehouse: newWarehouseStock,
      opening: newOpeningStock
    });

    // Update product stock levels
    const { error: updateError } = await supabase
      .from('products')
      .update({
        warehouse_stock: newWarehouseStock,
        opening_stock: newOpeningStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (updateError) throw updateError;

    console.log('✅ Warehouse stock added successfully');

  } catch (error) {
    console.error('❌ Warehouse stock operation failed:', error);
    throw error;
  }
};
