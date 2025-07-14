import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Package, Warehouse } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  status: 'active' | 'inactive';
  shelf_stock: number;
  warehouse_stock: number;
  created_at: string;
  is_archived: boolean;
  updated_by?: string;
  updated_at?: string;
}

const AdminInventory = () => {
  const { profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'created_at' | 'is_archived'>>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category: '',
    status: 'active',
    shelf_stock: 0,
    warehouse_stock: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  // Add state for restock modal
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [restockError, setRestockError] = useState('');

  // Get unique categories from products
  const categoryOptions = React.useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    return ['all', ...cats];
  }, [products]);

  // Filter products based on search, status, and category
  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchTerm, statusFilter, categoryFilter]);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'developer';

  // In fetchProducts, map DB fields to Product type correctly
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const transformedProducts = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description ?? '',
        price: item.unit_price ?? 0,
        image_url: item.image_url ?? '',
        category: item.category ?? '',
        status: (item.status === 'active' || item.status === 'true') ? 'active' as const : 'inactive' as const,
        shelf_stock: item.shelf_stock ?? 0,
        warehouse_stock: item.warehouse_stock ?? 0,
        created_at: item.created_at ?? '',
        is_archived: item.is_archived ?? false,
        updated_by: item.updated_by ?? '',
        updated_at: item.updated_at ?? '',
      } as Product));
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  // In handleCreateProduct, use only valid Product fields
  const handleCreateProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name,
          unit_price: newProduct.price,
          category: newProduct.category,
          shelf_stock: newProduct.shelf_stock,
          warehouse_stock: newProduct.warehouse_stock,
          status: newProduct.status,
          image_url: newProduct.image_url || null,
          description: newProduct.description || '',
          created_by: profile?.id || null
        }])
        .select()
        .single();

      if (error) throw error;

      const transformedProduct = {
        id: data.id,
        name: data.name,
        description: data.description ?? '',
        price: data.unit_price ?? 0,
        image_url: data.image_url ?? '',
        category: data.category ?? '',
        status: (data.status === 'active' || data.status === 'true') ? 'active' as const : 'inactive' as const,
        shelf_stock: data.shelf_stock ?? 0,
        warehouse_stock: data.warehouse_stock ?? 0,
        created_at: data.created_at ?? '',
        is_archived: data.is_archived ?? false,
        updated_by: data.updated_by ?? '',
        updated_at: data.updated_at ?? '',
      } as Product;
      setProducts(prev => [transformedProduct, ...prev]);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        category: '',
        status: 'active',
        shelf_stock: 0,
        warehouse_stock: 0,
      });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Product created successfully",
      });
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // In handleEditProduct, use only valid Product fields
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      category: product.category,
      status: product.status,
      shelf_stock: product.shelf_stock,
      warehouse_stock: product.warehouse_stock,
    });
    setIsDialogOpen(true);
  };

  // In handleUpdateProduct, use only valid Product fields
  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .update({
          name: newProduct.name,
          unit_price: newProduct.price,
          category: newProduct.category,
          shelf_stock: newProduct.shelf_stock,
          warehouse_stock: newProduct.warehouse_stock,
          status: newProduct.status,
          image_url: newProduct.image_url || null,
          description: newProduct.description || '',
          updated_by: profile?.id || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedProduct.id)
        .select()
        .single();

      if (error) throw error;

      const transformedProduct = {
        id: data.id,
        name: data.name,
        description: data.description ?? '',
        price: data.unit_price ?? 0,
        image_url: data.image_url ?? '',
        category: data.category ?? '',
        status: (data.status === 'active' || data.status === 'true') ? 'active' as const : 'inactive' as const,
        shelf_stock: data.shelf_stock ?? 0,
        warehouse_stock: data.warehouse_stock ?? 0,
        created_at: data.created_at ?? '',
        is_archived: data.is_archived ?? false,
        updated_by: data.updated_by ?? '',
        updated_at: data.updated_at ?? '',
      } as Product;
      setProducts(prev => prev.map(p => (p.id === selectedProduct.id ? transformedProduct : p)));
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedProduct(null);
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== product.id));
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
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

  // Define columns for shadcn DataTable
  const columns: ColumnDef<Product>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'category', header: 'Category' },
    { accessorKey: 'price', header: 'Price', cell: ({ row }) => `$${row.original.price}` },
    { accessorKey: 'shelf_stock', header: isAdmin ? 'Shelf Stock' : 'Available' },
    ...(isAdmin ? [{ accessorKey: 'warehouse_stock', header: 'Warehouse Stock' }] : []),
    { accessorKey: 'status', header: 'Status' },
    ...(isAdmin ? [{
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEditProduct(row.original)}>
            <Edit className="mr-2 h-4 w-4" />Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => {
            setRestockProduct(row.original);
            setIsRestockOpen(true);
            setRestockAmount('');
            setRestockError('');
          }}>
            <Warehouse className="mr-2 h-4 w-4" />Restock
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Are you sure you want to delete {row.original.name}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteProduct(row.original)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    }] : []),
  ];

  // 5. Implement restock logic: when admin adds to shelf_stock, check warehouse_stock, auto-debit, update updated_by/updated_at
  const handleRestockShelf = async (productId: string, addlStock: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (addlStock <= 0) return;
    if (product.warehouse_stock < addlStock) {
      toast({
        title: 'Insufficient Warehouse Stock',
        description: 'Not enough warehouse stock to restock shelf.',
        variant: 'destructive',
      });
      return;
    }
    const userId = profile?.id;
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('products')
      .update({
        shelf_stock: product.shelf_stock + addlStock,
        warehouse_stock: product.warehouse_stock - addlStock,
        updated_by: userId,
        updated_at: now,
      })
      .eq('id', productId)
      .select()
      .single();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to restock shelf.',
        variant: 'destructive',
      });
      return;
    }
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, shelf_stock: data.shelf_stock, warehouse_stock: data.warehouse_stock, updated_by: data.updated_by, updated_at: data.updated_at } : p));
    toast({
      title: 'Restocked',
      description: 'Shelf stock updated and warehouse debited.',
    });
  };

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Package className="h-8 w-8" />
              Inventory Management
            </h1>
            <p className="text-purple-100">Manage products, stock levels, and inventory</p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            variant="outline"
            className="border-white/50 text-white hover:border-white bg-white/20 hover:bg-white/30"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Custom Filter/Search Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Label htmlFor="search">Search</Label>
          <Input
            type="text"
            id="search"
            placeholder="Search by name or category"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <span className="absolute left-3 top-9 transform -translate-y-1/2 text-gray-400 h-4 w-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
          </span>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(cat => (
                <SelectItem key={cat} value={cat}>{cat === 'all' ? 'All' : cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isAdmin ? <Warehouse className="h-5 w-5" /> : <Package className="h-5 w-5" />}
            {isAdmin ? 'Warehouse Inventory' : 'Available Products'}
          </CardTitle>
          <CardDescription>
            <span className="block text-left w-full">
              {isAdmin ? 'Manage warehouse and shelf stock levels' : 'Products available for purchase'}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center">Loading products...</div>
          ) : (
            <DataTable columns={columns} data={filteredProducts} />
          )}
        </CardContent>
      </Card>

      {/* Dialog for adding/editing product */}
      {isAdmin && (
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{isEditMode ? "Edit Product" : "Add Product"}</AlertDialogTitle>
              <AlertDialogDescription>
                {isEditMode ? "Update the product details below:" : "Enter the details for the new product:"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  type="text"
                  id="category"
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  type="number"
                  id="price"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="shelf_stock">Shelf Stock</Label>
                  <Input
                    type="number"
                    id="shelf_stock"
                    name="shelf_stock"
                    value={newProduct.shelf_stock}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="warehouse_stock">Warehouse Stock</Label>
                  <Input
                    type="number"
                    id="warehouse_stock"
                    name="warehouse_stock"
                    value={newProduct.warehouse_stock}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  type="text"
                  id="image_url"
                  name="image_url"
                  value={newProduct.image_url}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={newProduct.status}
                  onChange={handleInputChange}
                  className="rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-purple-400 focus:outline-none focus:ring-purple-400/20"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </AlertDialogContent>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsDialogOpen(false);
                setIsEditMode(false);
                setSelectedProduct(null);
                setNewProduct({
                  name: '',
                  description: '',
                  price: 0,
                  image_url: '',
                  category: '',
                  status: 'active',
                  shelf_stock: 0,
                  warehouse_stock: 0,
                });
              }}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                if (isEditMode && selectedProduct) {
                  handleUpdateProduct();
                } else {
                  handleCreateProduct();
                }
              }} disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  <span>{isEditMode ? "Update Product" : "Create Product"}</span>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      {/* Restock Modal/Dialog */}
      {isAdmin && isRestockOpen && restockProduct && (
        <AlertDialog open={isRestockOpen} onOpenChange={(open) => {
          setIsRestockOpen(open);
          if (!open) {
            setRestockProduct(null);
            setRestockAmount('');
            setRestockError('');
          }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Restock Shelf for {restockProduct.name}</AlertDialogTitle>
              <AlertDialogDescription>
                Enter the amount to add to shelf stock. This will be debited from warehouse stock.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-2">
              <div className="flex justify-between text-sm">
                <span>Shelf Stock: <b>{restockProduct.shelf_stock}</b></span>
                <span>Warehouse Stock: <b>{restockProduct.warehouse_stock}</b></span>
              </div>
              <Label htmlFor="restockAmount">Additional Shelf Stock</Label>
              <Input
                id="restockAmount"
                type="number"
                min="1"
                value={restockAmount}
                onChange={e => setRestockAmount(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter quantity"
              />
              {restockError && <div className="text-red-500 text-xs mt-1">{restockError}</div>}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsRestockOpen(false);
                setRestockProduct(null);
                setRestockAmount('');
                setRestockError('');
              }}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  const qty = parseInt(restockAmount, 10);
                  if (!qty || qty <= 0) {
                    setRestockError('Enter a valid quantity');
                    return;
                  }
                  if (qty > restockProduct.warehouse_stock) {
                    setRestockError('Not enough warehouse stock');
                    return;
                  }
                  setRestockError('');
                  await handleRestockShelf(restockProduct.id, qty);
                  setIsRestockOpen(false);
                  setRestockProduct(null);
                  setRestockAmount('');
                }}
                disabled={loading}
              >
                {loading ? 'Restocking...' : 'Restock'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default AdminInventory;