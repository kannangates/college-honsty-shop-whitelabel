
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
    const { data: updated, error: updateError } = await supabase
      .from('products')
      .update({
        warehouse_stock: newWarehouseStock,
        opening_stock: newOpeningStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select('id, warehouse_stock, opening_stock')
      .maybeSingle();

    if (updateError) throw updateError;
    if (!updated) {
      console.warn('⚠️ Warehouse stock update returned no row. Possible RLS block or missing product.', { productId });
      throw new Error('Not authorized to update product or product not found');
    }
    console.log('✅ Warehouse stock added successfully');

  } catch (error) {
    console.error('❌ Warehouse stock operation failed:', error);
    throw error;
  }
};
