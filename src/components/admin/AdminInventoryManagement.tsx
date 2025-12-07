import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Package, Pencil, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/features/gamification/components/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { PRODUCT_CATEGORIES } from '@/constants/productCategories';

import { InventoryFilters } from './InventoryFilters';
import { AddProductModal } from './AddProductModal';
import { EditProductModal } from './EditProductModal';
import { RestockModal } from './RestockModal';

interface Product {
  id: string;
  name: string;
  category: string;
  unit_price: number;
  opening_stock: number;
  warehouse_stock: number;
  shelf_stock: number;
  status: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  image_url?: string;
  description?: string;
  updated_by?: string;
}


interface InventoryFiltersState {
  search: string;
  category: string;
  status: string;
  stockLevel: string;
}

export const AdminInventoryManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<InventoryFiltersState>({
    search: '',
    category: '',
    status: '',
    stockLevel: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<Product | null>(null);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedForRestock, setSelectedForRestock] = useState<Product | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  const { toast } = useToast();

  const fetchProducts = async () => {
    console.log('📦 Fetching products...');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch products',
          variant: 'destructive',
        });
        return;
      }

      console.log('📦 Products fetched:', data?.length || 0);
      setProducts(data || []);

    } catch (error) {
      console.error('Error in fetchProducts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    // Categories are now defined in constants, no need to fetch
  };

  const fetchLowStockProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or('shelf_stock.lt.10,warehouse_stock.lt.10');

      if (error) {
        console.error('Error fetching low stock products:', error);
        return;
      }

      setLowStockProducts(data || []);
    } catch (error) {
      console.error('Error in fetchLowStockProducts:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchLowStockProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (showLowStock) {
      filtered = filtered.filter(product =>
        (product.shelf_stock || 0) < 10 || (product.warehouse_stock || 0) < 10
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, showLowStock]);




  const openEditModal = (product: Product) => {
    setSelectedForEdit(product);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedForEdit(null);
  };

  const openRestockModal = (product: Product) => {
    setSelectedForRestock(product);
    setRestockModalOpen(true);
  };

  const closeRestockModal = () => {
    setRestockModalOpen(false);
    setSelectedForRestock(null);
  };

  const handleProductUpdate = async (id: string, updates: Partial<Product>) => {
    try {
      const mappedUpdates: any = {
        name: updates.name,
        category: updates.category,
        unit_price: (updates as any).price ?? updates.unit_price,
        image_url: updates.image_url,
        status: updates.status,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('products')
        .update(mappedUpdates)
        .eq('id', id);

      if (error) throw error;

      await fetchProducts();
      toast({ title: 'Updated', description: 'Product updated successfully' });
      closeEditModal();
    } catch (err: any) {
      console.error('Error updating product:', err);
      toast({ title: 'Error', description: err.message || 'Failed to update product', variant: 'destructive' });
      throw err;
    }
  };

  const handleStockUpdated = async () => {
    // Refresh products data after stock operations
    await fetchProducts();
  };

  const openAddModal = () => {
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
  };

  const handleAddProduct = async (productData: any) => {
    setAddLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          unit_price: productData.price,
          image_url: productData.image_url,
          category: productData.category,
          status: productData.status,
          shelf_stock: productData.shelf_stock,
          warehouse_stock: productData.warehouse_stock,
          opening_stock: (productData.shelf_stock || 0) + (productData.warehouse_stock || 0),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      await fetchProducts();
      toast({ title: 'Success', description: 'Product added successfully' });
      closeAddModal();
    } catch (err: any) {
      console.error('Error adding product:', err);
      toast({ title: 'Error', description: err.message || 'Failed to add product', variant: 'destructive' });
      throw err;
    } finally {
      setAddLoading(false);
    }
  };

  const getStockBadgeVariant = (stock: number, type: 'warehouse' | 'shelf') => {
    if (stock === 0) return 'destructive';
    if (stock < 10) return 'secondary';
    return 'default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage product stock levels and inventory operations
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Low Stock Alert removed as requested */}

      {/* Filters */}
      <InventoryFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        showLowStock={showLowStock}
        onLowStockToggle={() => setShowLowStock(!showLowStock)}
        categories={PRODUCT_CATEGORIES}
        lowStockCount={lowStockProducts.length}
      />

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Opening Stock</TableHead>
                  <TableHead>Warehouse Stock</TableHead>
                  <TableHead>Shelf Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>₹{product.unit_price}</TableCell>
                    <TableCell>{product.opening_stock}</TableCell>
                    <TableCell>
                      <Badge variant={getStockBadgeVariant(product.warehouse_stock || 0, 'warehouse')}>
                        {product.warehouse_stock || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStockBadgeVariant(product.shelf_stock || 0, 'shelf')}>
                        {product.shelf_stock || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRestockModal(product)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Restock
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(product)}
                          className="flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No products found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={addModalOpen}
        onClose={closeAddModal}
        onAdd={handleAddProduct}
        loading={addLoading}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        product={selectedForEdit}
        onUpdate={handleProductUpdate}
      />

      {/* Restock Modal */}
      <RestockModal
        isOpen={restockModalOpen}
        onClose={closeRestockModal}
        product={selectedForRestock}
        onStockUpdated={handleStockUpdated}
      />
    </div>
  );
};
