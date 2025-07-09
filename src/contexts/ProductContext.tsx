// eslint-disable react-refresh/only-export-components
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export type Product = Tables<'products'> & {
  description?: string;
  price: number;
};

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        const transformedProducts = (data || []).map(item => ({
          ...item,
          description: '',
          price: item.unit_price
        }));
        setProducts(transformedProducts);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'created_at'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select();

      if (error) {
        setError(error.message);
      } else if (data) {
        const transformedProduct = {
          ...data[0],
          description: '',
          price: data[0].unit_price
        };
        setProducts(prevProducts => [...prevProducts, transformedProduct]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        setError(error.message);
      } else if (data) {
        const transformedProduct = {
          ...data[0],
          description: '',
          price: data[0].unit_price
        };
        setProducts(prevProducts =>
          prevProducts.map(product => (product.id === id ? transformedProduct : product))
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        setError(error.message);
      } else {
        setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const value: ProductContextType = {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
