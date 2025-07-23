
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useBadgeService } from '@/features/gamification/hooks/useBadgeService';

interface Product {
  id: string;
  name: string;
  unit_price: number;
  image_url?: string;
}

interface CartItem {
  id: string;
  name: string;
  unit_price: number;
  quantity: number;
  image_url?: string;
}

export const useCart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { awardBadgesForUser } = useBadgeService();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addToCart = (product: Product) => {
    const existingItem = items.find((item: CartItem) => item.id === product.id);
    if (existingItem) {
      setItems(items.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setItems([...items, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setItems(items.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (productId: string): number => {
    const item = items.find((item: CartItem) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const getTotalAmount = (): number => {
    return items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  };

  const checkout = async (paymentMode: 'immediate' | 'later') => {
    if (!user?.id || items.length === 0) return null;

    setIsLoading(true);
    try {
      const totalAmount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

      // Map payment modes to database enum values
      const dbPaymentMode = paymentMode === 'immediate' ? 'qr_manual' : 'pay_later';

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          payment_status: paymentMode === 'immediate' ? 'paid' : 'unpaid',
          payment_mode: dbPaymentMode,
          paid_at: paymentMode === 'immediate' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items and update shelf stock
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update shelf stock for each product
      for (const item of items) {
        const { data: product, error: fetchError } = await supabase
          .from('products')
          .select('shelf_stock')
          .eq('id', item.id)
          .single();

        if (fetchError) {
          console.error('Error fetching product:', fetchError);
          continue;
        }

        const newShelfStock = Math.max(0, (product.shelf_stock || 0) - item.quantity);
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            shelf_stock: newShelfStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        if (updateError) {
          console.error('Error updating product stock:', updateError);
        }
      }

      // Award badges for the new order
      try {
        await awardBadgesForUser(order.id);
      } catch (badgeError) {
        console.error('Error awarding badges:', badgeError);
        // Don't fail the order if badge awarding fails
      }

      // Clear cart
      setItems([]);
      
      toast({
        title: 'Order Placed Successfully!',
        description: `Order #${order.id.slice(0, 8)} has been created.`,
      });

      return order;
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: 'There was an error processing your order. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    cart: items, // Alias for backwards compatibility
    addItem: addToCart,
    addToCart, // Backwards compatibility
    removeItem: removeFromCart,
    removeFromCart, // Backwards compatibility
    updateQuantity: (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
      } else {
        setItems(items.map(item => 
          item.id === productId ? { ...item, quantity } : item
        ));
      }
    },
    clearCart,
    checkout,
    getTotalAmount, // Backwards compatibility
    getItemQuantity, // Backwards compatibility
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0),
    isLoading
  };
};
