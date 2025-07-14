import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EditProductModal } from './EditProductModal';
import { AddProductModal } from './AddProductModal';
import { RestockModal } from './RestockModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Check,
  Package2,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { InventoryFilters } from './InventoryFilters';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'inactive';
  shelf_stock: number;
  warehouse_stock: number;
  created_at: string;
  created_by: string | null;
  image_url: string | null;
  is_archived: boolean | null;
  opening_stock: number;
  unit_price: number;
  updated_by?: string | null;
  updated_at?: string | null;
}

interface SortConfig {
  key: keyof Product;
  direction: 'asc' | 'desc';
}

interface ProductInput {
  name: string;
  unit_price: number;
  category: string;
  shelf_stock: number;
  warehouse_stock: number;
  status: 'active' | 'inactive';
  image_url?: string;
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
  const [totalLowStock, setTotalLowStock] = useState(0);
  const itemsPerPage = 10;
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const lowStockThreshold = 10;
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // First, get total low stock count
      const { count: lowStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .or(`shelf_stock.lt.${lowStockThreshold},warehouse_stock.lt.${lowStockThreshold}`);
      
      setTotalLowStock(lowStockCount || 0);

      // Main query for products
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' });

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      // Apply status filter
      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
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
  }, [toast, currentPage, sortConfig, selectedCategory, selectedStatus, showLowStock]);

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
          unit_price: updates.unit_price,
          category: updates.category,
          status: updates.status,
          image_url: updates.image_url || null,
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
          unit_price: productInput.unit_price,
          category: productInput.category,
          shelf_stock: productInput.shelf_stock,
          warehouse_stock: productInput.warehouse_stock,
          status: productInput.status,
          image_url: productInput.image_url || null,
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

  const handleRestock = async (productId: string, quantity: number) => {
    try {
      setLoading(true);
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const { error } = await supabase
        .from('products')
        .update({
          warehouse_stock: product.warehouse_stock + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Added ${quantity} units to warehouse stock`,
      });
      fetchProducts();
    } catch (error) {
      console.error('Error restocking product:', error);
      toast({
        title: "Error",
        description: "Failed to restock product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    await deleteProduct(productToDelete);
    setDeleteConfirmOpen(false);
    setProductToDelete(null);
  };

  const getSortIcon = (key: keyof Product) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-4 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Package2 className="h-6 w-6" />
              Inventory Management
            </h1>
            <p className="text-purple-100 text-sm">Manage product inventory and track stock levels</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setAddModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      {/* Custom Filter/Search Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <Input
            type="text"
            placeholder="Search by name or category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9"
          />
        </div>
        <div>
          <Select value={selectedCategory} onValueChange={(value) => {
            setSelectedCategory(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={selectedStatus} onValueChange={(value) => {
            setSelectedStatus(value);
            setCurrentPage(1);
          }}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label className="flex items-center gap-2">
            Low Stock ({totalLowStock}):
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => {
                setShowLowStock(e.target.checked);
                setCurrentPage(1);
              }}
              className="rounded border-gray-300"
            />
          </Label>
        </div>
      </div>

      {/* Products Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-gray-800 text-lg">All Products ({products.length})</CardTitle>
            {selectedProducts.length > 0 && (
              <Button
                onClick={handleBulkDelete}
                variant="destructive"
                size="sm"
                className="h-8"
              >
                Delete Selected ({selectedProducts.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
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
                <TableHead onClick={() => handleSort('unit_price')} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Price {getSortIcon('unit_price')}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('category')} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Category {getSortIcon('category')}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('shelf_stock')} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Shelf Stock {getSortIcon('shelf_stock')}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('warehouse_stock')} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Warehouse Stock {getSortIcon('warehouse_stock')}
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    Status {getSortIcon('status')}
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>${product.unit_price.toFixed(2)}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Badge variant={product.shelf_stock < lowStockThreshold ? "destructive" : "default"}>
                        {product.shelf_stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.warehouse_stock < lowStockThreshold ? "destructive" : "default"}>
                        {product.warehouse_stock}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === 'active' ? "default" : "secondary"}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingProduct(product);
                            setEditModalOpen(true);
                          }}
                          className="h-8 px-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRestockingProduct(product)}
                          className="h-8 px-2"
                        >
                          <Package2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setProductToDelete(product.id);
                            setDeleteConfirmOpen(true);
                          }}
                          className="h-8 px-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {products.length} of {totalPages * itemsPerPage} products
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
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
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
        </CardContent>
      </Card>

      {/* Modals */}
      <RestockModal
        isOpen={!!restockingProduct}
        onClose={() => setRestockingProduct(null)}
        product={restockingProduct}
        onRestock={handleRestock}
      />

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

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
