import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  unit_price: number;
  opening_stock: number;
  category: string;
  image_url?: string;
  status: string;
  created_at: string;
  is_archived: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  cart: CartItem[];
  updateQuantity: (productId: string, quantity: number, product?: Product) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  getItemQuantity: (productId: string) => number;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_archived', false)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast({ title: 'Fetch Failed', description: 'Unable to load products', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateQuantity = (productId: string, quantity: number, product?: Product) => {
    if (quantity < 1) {
      setCart(prev => prev.filter(i => i.id !== productId));
      return;
    }
    setCart(prev => {
      const index = prev.findIndex(i => i.id === productId);
      if (index === -1 && product) {
        return [...prev, { ...product, quantity }];
      }
      if (index !== -1) {
        const newCart = [...prev];
        newCart[index].quantity = quantity;
        return newCart;
      }
      return prev;
    });
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    const quantity = existing ? existing.quantity + 1 : 1;
    updateQuantity(product.id, quantity, product);
  };

  const removeFromCart = (productId: string) => {
    const existing = cart.find(item => item.id === productId);
    if (!existing) return;
    const quantity = existing.quantity - 1;
    updateQuantity(productId, quantity);
  };

  const getItemQuantity = (productId: string) => {
    const item = cart.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  const clearCart = () => setCart([]);

  const getTotalAmount = () =>
    cart.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        fetchProducts,
        cart,
        updateQuantity,
        clearCart,
        getTotalAmount,
        addToCart,
        removeFromCart,
        getItemQuantity
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProductContext must be used within a ProductProvider');
  return context;
};

export { ProductProvider, useProductContext };