import { supabase } from '@/integrations/supabase/client';

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
    // Get current product stock levels
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('warehouse_stock, shelf_stock, opening_stock')
      .eq('id', productId)
      .single();

    if (productError) throw productError;
    if (!product) throw new Error('Product not found');

    console.log('📦 Current stock levels:', product);

    // Calculate new stock levels based on restock type
    let newWarehouseStock = product.warehouse_stock;
    let newShelfStock = product.shelf_stock;
    let newOpeningStock = product.opening_stock;

    if (restockType === 'warehouse') {
      // Add to warehouse stock
      newWarehouseStock = product.warehouse_stock + quantity;
      newOpeningStock = product.opening_stock + quantity; // Total stock also increases
    } else if (restockType === 'shelf') {
      // Move from warehouse to shelf
      if (quantity > product.warehouse_stock) {
        throw new Error(`Cannot move ${quantity} units to shelf. Only ${product.warehouse_stock} units available in warehouse.`);
      }
      newWarehouseStock = product.warehouse_stock - quantity;
      newShelfStock = product.shelf_stock + quantity;
      // Opening stock remains the same as we're just moving stock around
    }

    console.log('📊 New stock levels:', {
      warehouse: newWarehouseStock,
      shelf: newShelfStock,
      opening: newOpeningStock
    });

    // Update product stock levels
    const { error: updateError } = await supabase
      .from('products')
      .update({
        warehouse_stock: newWarehouseStock,
        shelf_stock: newShelfStock,
        opening_stock: newOpeningStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (updateError) throw updateError;

    // Record the restock operation in daily_stock_operations
    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's already an entry for today
    const { data: existingEntry } = await supabase
      .from('daily_stock_operations')
      .select('*')
      .eq('product_id', productId)
      .gte('created_at', today + 'T00:00:00')
      .lt('created_at', today + 'T23:59:59')
      .single();

    if (existingEntry) {
      // Update existing entry
      const { error: stockOpError } = await supabase
        .from('daily_stock_operations')
        .update({
          warehouse_stock: newWarehouseStock,
          additional_stock: (existingEntry.additional_stock || 0) + (restockType === 'warehouse' ? quantity : 0),
          estimated_closing_stock: newOpeningStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEntry.id);

      if (stockOpError) throw stockOpError;
    } else {
      // Create new entry
      const { error: stockOpError } = await supabase
        .from('daily_stock_operations')
        .insert({
          product_id: productId,
          opening_stock: product.opening_stock, // Original opening stock
          warehouse_stock: newWarehouseStock,
          additional_stock: restockType === 'warehouse' ? quantity : 0,
          estimated_closing_stock: newOpeningStock,
          actual_closing_stock: null,
          stolen_stock: null,
          wastage_stock: 0,
          sales: 0,
          order_count: 0
        });

      if (stockOpError) throw stockOpError;
    }

    console.log('✅ Restock operation completed successfully');

  } catch (error) {
    console.error('❌ Restock operation failed:', error);
    throw error;
  }
};
