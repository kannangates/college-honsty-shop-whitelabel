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
} from "@/components/ui/table";
import { 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { InventoryFilters } from './InventoryFilters';

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

interface SortConfig {
  key: keyof Product;
  direction: 'asc' | 'desc';
}

interface ProductInput {
  name: string;
  price: number;
  category: string;
  shelf_stock: number;
  warehouse_stock: number;
  status: 'active' | 'inactive';
  image_url?: string;
  description?: string;
}

export const AdminInventoryManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const lowStockThreshold = 10;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      // Apply low stock filter
      if (showLowStock) {
        query = query.or(`shelf_stock.lt.${lowStockThreshold},warehouse_stock.lt.${lowStockThreshold}`);
      }

      // Apply sorting
      query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });

      // Apply pagination
      const start = (currentPage - 1) * itemsPerPage;
      query = query.range(start, start + itemsPerPage - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      const transformedProducts = (data || []).map(item => ({
        ...item,
        description: item.description || '',
        price: item.unit_price,
        status: (item.status === 'active' || item.status === 'true') ? 'active' as const : 'inactive' as const
      }));

      setProducts(transformedProducts);
      if (count) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      // Fetch unique categories
      const { data: categoryData } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

      if (categoryData) {
        const uniqueCategories = Array.from(new Set(categoryData.map(item => item.category)));
        setCategories(uniqueCategories);
      }
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
  }, [toast, currentPage, sortConfig, selectedCategory, showLowStock]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSort = (key: keyof Product) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(current =>
      current.includes(productId)
        ? current.filter(id => id !== productId)
        : [...current, productId]
    );
  };

  const handleBulkDelete = async () => {
    if (!selectedProducts.length) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedProducts);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedProducts.length} products deleted successfully`,
      });
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
      toast({
        title: "Error",
        description: "Failed to delete products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditModalOpen(true);
  };

  const handleUpdate = async (id: string, updates: Partial<Product>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updates.name,
          unit_price: updates.price,
          category: updates.category,
          status: updates.status,
          image_url: updates.image_url || null,
          description: updates.description || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

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

  const handleAddProduct = async (productInput: ProductInput) => {
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

  const getSortIcon = (key: keyof Product) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
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
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">Products</h2>
              {selectedProducts.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={loading}
                >
                  Delete Selected ({selectedProducts.length})
                </Button>
              )}
            </div>
            <Button 
              onClick={() => setAddModalOpen(true)} 
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900"
            >
              Add Product
            </Button>
          </div>

          <InventoryFilters
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            showLowStock={showLowStock}
            onLowStockToggle={() => setShowLowStock(!showLowStock)}
            categories={categories}
            lowStockCount={products.filter(p => 
              p.shelf_stock < lowStockThreshold || 
              p.warehouse_stock < lowStockThreshold
            ).length}
          />
        </CardContent>
      </Card>

      <Card className="shadow-lg mt-8">
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2">Loading products...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        Name {getSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead onClick={() => handleSort('price')} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        Price {getSortIcon('price')}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('category')} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        Category {getSortIcon('category')}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        Status {getSortIcon('status')}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('shelf_stock')} className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        Stock {getSortIcon('shelf_stock')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(product => (
                    <TableRow key={product.id} className={
                      (product.shelf_stock < lowStockThreshold || product.warehouse_stock < lowStockThreshold)
                        ? 'bg-red-50'
                        : ''
                    }>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.description}</TableCell>
                      <TableCell>₹{product.price}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>Shelf: {product.shelf_stock}</span>
                          <span>Warehouse: {product.warehouse_stock}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between py-4">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, products.length)} of {products.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
