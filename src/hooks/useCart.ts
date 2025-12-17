
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useStockManagement } from './useStockManagement';
import { useBadgeService } from '@/features/gamification/hooks/useBadgeService';
import { cartStorage } from '@/utils/cartStorage';

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

interface OrderRecord {
  id: string;
  friendly_id: string | null;
  total_amount: number;
}

export const useCart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { awardBadgesForUser } = useBadgeService();
  const { adjustShelfStock } = useStockManagement();

  // Initialize cart from localStorage
  const [items, setItems] = useState<CartItem[]>(() => {
    return cartStorage.isAvailable() ? cartStorage.load(user?.id) : [];
  });

  const [isLoading, setIsLoading] = useState(false);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (cartStorage.isAvailable()) {
      cartStorage.save(items, user?.id);
    }
  }, [items, user?.id]);

  // Clear cart when user changes (logout/login)
  useEffect(() => {
    if (cartStorage.isAvailable()) {
      const userSpecificCart = cartStorage.load(user?.id);
      setItems(userSpecificCart);
    }
  }, [user?.id]);

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
    const existingItem = items.find((item: CartItem) => item.id === productId);
    if (existingItem && existingItem.quantity > 1) {
      // Reduce quantity by 1 if more than 1
      setItems(items.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      ));
    } else {
      // Remove item if quantity is 1 or less
      setItems(items.filter(item => item.id !== productId));
    }
  };

  const clearCart = () => {
    setItems([]);
    // Also clear from localStorage
    if (cartStorage.isAvailable()) {
      cartStorage.clear(user?.id);
    }
  };

  const getItemQuantity = (productId: string): number => {
    const item = items.find((item: CartItem) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const getTotalAmount = (): number => {
    return items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  };

  const checkout = async (paymentMode: 'immediate' | 'later'): Promise<OrderRecord | null> => {
    if (!user?.id || items.length === 0) return null;

    setIsLoading(true);
    try {
      const totalAmount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

      // Map payment modes to database enum values
      // For 'immediate' (Pay Now), we create as unpaid since user still needs to enter transaction ID
      // For 'later' (Pay Later), we create as unpaid
      const dbPaymentMode = paymentMode === 'immediate' ? 'qr_manual' : 'pay_later';

      // Create order - always starts as unpaid, will be marked paid when transaction ID is entered
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          payment_status: 'unpaid', // Always start as unpaid
          payment_mode: dbPaymentMode,
          paid_at: null, // Will be set when payment is confirmed
        })
        .select('id,friendly_id,total_amount')
        .single<OrderRecord>();

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

      // Update shelf stock for each product using the stock management system
      for (const item of items) {
        const stockResult = await adjustShelfStock(item.id, -item.quantity, 'Checkout');
        if (!stockResult.success) {
          throw new Error(`Failed to update stock for ${item.name}: ${stockResult.error}`);
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
      clearCart();

      toast({
        title: 'Order Placed Successfully!',
        description: `Order #${order.friendly_id || order.id.slice(0, 8)} has been created.`,
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
        // Remove the item completely
        setItems(items.filter(item => item.id !== productId));
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
