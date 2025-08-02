import { supabase } from '@/integrations/supabase/client';

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
  console.log('📦 Moving stock from warehouse to shelf:', { productId, quantity });

  try {
    // Get current product stock levels
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('warehouse_stock, shelf_stock')
      .eq('id', productId)
      .single();

    if (productError) throw productError;
    if (!product) throw new Error('Product not found');

    console.log('📦 Current stock levels:', {
      warehouse: product.warehouse_stock,
      shelf: product.shelf_stock
    });

    // Validate sufficient warehouse stock
    if (quantity > product.warehouse_stock) {
      throw new Error(`Cannot move ${quantity} units to shelf. Only ${product.warehouse_stock} units available in warehouse.`);
    }

    // Calculate new stock levels
    const newWarehouseStock = product.warehouse_stock - quantity;
    const newShelfStock = product.shelf_stock + quantity;

    console.log('📊 New stock levels after move:', {
      warehouse: newWarehouseStock,
      shelf: newShelfStock
    });

    // Update product stock levels
    const { error: updateError } = await supabase
      .from('products')
      .update({
        warehouse_stock: newWarehouseStock,
        shelf_stock: newShelfStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (updateError) throw updateError;

    console.log('✅ Stock moved to shelf successfully');

  } catch (error) {
    console.error('❌ Shelf stock operation failed:', error);
    throw error;
  }
};