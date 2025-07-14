import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EditProductModal } from './EditProductModal';
import { AddProductModal } from './AddProductModal';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
  category: string;
  status: 'active' | 'inactive';
  shelf_stock: number;
  warehouse_stock: number;
  created_at: string;
  is_archived: boolean;
  updated_by?: string;
  updated_at?: string;
}

export const AdminInventoryManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
        const transformedProducts = (data || []).map(item => ({
          ...item,
          description: '',
          price: item.unit_price,
          status: (item.status === 'active' || item.status === 'true') ? 'active' as const : 'inactive' as const
        }));
        setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditModalOpen(true);
  };

  const handleUpdate = async (updatedProduct: Product) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updatedProduct.name,
          unit_price: updatedProduct.price,
          category: updatedProduct.category,
          shelf_stock: updatedProduct.shelf_stock,
          warehouse_stock: updatedProduct.warehouse_stock,
          status: updatedProduct.status,
          image_url: updatedProduct.image_url || null,
          description: updatedProduct.description || '',
        })
        .eq('id', updatedProduct.id);
      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setEditModalOpen(false);
      setEditingProduct(null);
    }
  };

  // Move addProduct logic to be used by the modal
  const handleAddProduct = async (productInput) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .insert([{
          name: productInput.name,
          unit_price: productInput.price,
          category: productInput.category,
          shelf_stock: productInput.shelf_stock,
          warehouse_stock: productInput.warehouse_stock,
          status: productInput.status,
          image_url: productInput.image_url || null,
          description: productInput.description || '',
          created_by: null
        }]);
      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Product added successfully',
      });
      fetchProducts();
      setAddModalOpen(false);
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>Add, edit, and delete products</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Products</h2>
            <Button onClick={() => setAddModalOpen(true)} className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white">Add Product</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg mt-8">
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading products...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.description}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.status}</TableCell>
                      <TableCell>{product.shelf_stock + product.warehouse_stock}</TableCell>
                      <TableCell className="text-right flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(product)}
                          className="h-8 px-2"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                          disabled={loading}
                        >
                          {loading ? "Deleting..." : "Delete"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* EditProductModal for editing */}
      <EditProductModal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingProduct(null); }}
        product={editingProduct}
        onUpdate={handleUpdate}
      />
      <AddProductModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddProduct}
        loading={loading}
      />
    </div>
  );
};
