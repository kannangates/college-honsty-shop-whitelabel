import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useStockManagement = () => {
  const { toast } = useToast();

  const restoreStock = async (orderId: string) => {
    try {
      console.log('📦 Restoring stock for cancelled order:', orderId);
      
      // Get order items to restore stock
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);

      if (orderItemsError) throw orderItemsError;

      if (!orderItems || orderItems.length === 0) {
        console.log('No order items found for order:', orderId);
        return;
      }

      // Restore stock for each product
      for (const item of orderItems) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('shelf_stock')
          .eq('id', item.product_id)
          .single();

        if (productError) {
          console.error('Error fetching product for stock restoration:', productError);
          continue;
        }

        const newShelfStock = (product.shelf_stock || 0) + item.quantity;
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            shelf_stock: newShelfStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.product_id);

        if (updateError) {
          console.error('Error restoring stock for product:', item.product_id, updateError);
        } else {
          console.log(`✅ Restored ${item.quantity} units to product ${item.product_id}`);
        }
      }

      toast({
        title: 'Stock Restored',
        description: 'Product quantities have been restored to shelf stock.',
      });

    } catch (error) {
      console.error('Error restoring stock:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore stock quantities',
        variant: 'destructive',
      });
    }
  };

  const reduceStock = async (orderId: string) => {
    try {
      console.log('📦 Reducing stock for order:', orderId);
      
      // Get order items to reduce stock
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId);

      if (orderItemsError) throw orderItemsError;

      if (!orderItems || orderItems.length === 0) {
        console.log('No order items found for order:', orderId);
        return;
      }

      // Reduce stock for each product
      for (const item of orderItems) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('shelf_stock')
          .eq('id', item.product_id)
          .single();

        if (productError) {
          console.error('Error fetching product for stock reduction:', productError);
          continue;
        }

        const newShelfStock = Math.max(0, (product.shelf_stock || 0) - item.quantity);
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            shelf_stock: newShelfStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.product_id);

        if (updateError) {
          console.error('Error reducing stock for product:', item.product_id, updateError);
        } else {
          console.log(`✅ Reduced ${item.quantity} units from product ${item.product_id}`);
        }
      }

    } catch (error) {
      console.error('Error reducing stock:', error);
    }
  };

  return {
    restoreStock,
    reduceStock
  };
};