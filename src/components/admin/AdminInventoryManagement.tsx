import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Package, Warehouse, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/features/gamification/components/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { RestockModal } from './RestockModal';
import { InventoryFilters } from './InventoryFilters';
import { handleRestockOperation } from '@/utils/restockUtils';
import { EditProductModal } from './EditProductModal';

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
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<InventoryFiltersState>({
    search: '',
    category: '',
    status: '',
    stockLevel: ''
  });
const [selectedCategory, setSelectedCategory] = useState('all');
const [showLowStock, setShowLowStock] = useState(false);
const [editModalOpen, setEditModalOpen] = useState(false);
const [selectedForEdit, setSelectedForEdit] = useState<Product | null>(null);

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
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      const uniqueCategories = [...new Set(data.map(item => item.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error in fetchCategories:', error);
    }
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

  const handleRestock = async (productId: string, quantity: number, restockType: 'warehouse' | 'shelf') => {
    try {
      console.log('🔄 Handling restock operation:', { productId, quantity, restockType });
      
      await handleRestockOperation(productId, quantity, restockType);
      
      // Refresh all data after successful restock
      await Promise.all([
        fetchProducts(),
        fetchLowStockProducts()
      ]);

      toast({
        title: 'Stock Updated',
        description: `Successfully ${restockType === 'warehouse' ? 'added' : 'moved'} ${quantity} units`,
      });

      setRestockModalOpen(false);
      setSelectedProduct(null);

    } catch (error: any) {
      console.error('Error restocking product:', error);
      
      // Enhanced error handling for authorization issues
      let errorMessage = 'Failed to restock product';
      if (error.message?.includes('Not authorized')) {
        errorMessage = 'You do not have permission to update product stock';
      } else if (error.message?.includes('Cannot move')) {
        errorMessage = error.message; // Use the specific validation message
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Restock Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const openRestockModal = (product: Product) => {
    setSelectedProduct(product);
    setRestockModalOpen(true);
  };

const closeRestockModal = () => {
  setRestockModalOpen(false);
  setSelectedProduct(null);
};

const openEditModal = (product: Product) => {
  setSelectedForEdit(product);
  setEditModalOpen(true);
};

const closeEditModal = () => {
  setEditModalOpen(false);
  setSelectedForEdit(null);
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
      </div>

{/* Low Stock Alert removed as requested */}

      {/* Filters */}
      <InventoryFilters 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        showLowStock={showLowStock}
        onLowStockToggle={() => setShowLowStock(!showLowStock)}
        categories={categories}
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
    onClick={() => openEditModal(product)}
    className="flex items-center gap-2"
  >
    <Pencil className="h-4 w-4" />
    Edit
  </Button>
  <Button
    variant="outline"
    size="sm"
    onClick={() => openRestockModal(product)}
    className="flex items-center gap-2"
  >
    <Warehouse className="h-4 w-4" />
    Restock
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

{/* Restock Modal */}
<RestockModal
  isOpen={restockModalOpen}
  onClose={closeRestockModal}
  product={selectedProduct}
  onRestock={handleRestock}
/>

{/* Edit Product Modal */}
<EditProductModal
  isOpen={editModalOpen}
  onClose={closeEditModal}
  product={selectedForEdit}
  onUpdate={handleProductUpdate}
/>
    </div>
  );
};
