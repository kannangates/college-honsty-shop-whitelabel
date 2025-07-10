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

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  status: 'active' | 'inactive';
  current_stock: number; // Shelf stock (what students see)
  warehouse_stock?: number; // Warehouse stock (admin only)
  created_at: string;
  is_archived: boolean;
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
    current_stock: 0,
    warehouse_stock: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'developer';

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
        status: (item.status === 'active' || item.status === 'true') ? 'active' as const : 'inactive' as const,
        warehouse_stock: Math.max(item.current_stock + Math.floor(Math.random() * 50), item.current_stock) // Mock warehouse stock for now
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name,
          unit_price: newProduct.price,
          category: newProduct.category,
          current_stock: newProduct.current_stock,
          opening_stock: 0,
          status: newProduct.status,
          image_url: newProduct.image_url || null,
          created_by: null
        }])
        .select()
        .single();

      if (error) throw error;

      const transformedProduct = {
        ...data,
        description: '',
        price: data.unit_price,
        status: (data.status === 'active' || data.status === 'true') ? 'active' as const : 'inactive' as const,
        warehouse_stock: newProduct.warehouse_stock || newProduct.current_stock
      };
      setProducts(prev => [transformedProduct, ...prev]);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        category: '',
        status: 'active',
        current_stock: 0,
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
      current_stock: product.current_stock,
      warehouse_stock: product.warehouse_stock || product.current_stock,
    });
    setIsDialogOpen(true);
  };

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
          current_stock: newProduct.current_stock,
          status: newProduct.status,
          image_url: newProduct.image_url || null
        })
        .eq('id', selectedProduct.id)
        .select()
        .single();

      if (error) throw error;

      const transformedProduct = {
        ...data,
        description: '',
        price: data.unit_price,
        status: (data.status === 'active' || data.status === 'true') ? 'active' as const : 'inactive' as const,
        warehouse_stock: newProduct.warehouse_stock
      };
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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isAdmin ? <Warehouse className="h-5 w-5" /> : <Package className="h-5 w-5" />}
            {isAdmin ? 'Warehouse Inventory' : 'Available Products'}
          </CardTitle>
          <CardDescription>
            {isAdmin ? 'Manage warehouse and shelf stock levels' : 'Products available for purchase'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center">
              Loading products...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isAdmin ? 'Shelf Stock' : 'Available'}
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Warehouse Stock
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map(product => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.current_stock}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.warehouse_stock || product.current_stock}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.status}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. Are you sure you want to delete {product.name}?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProduct(product)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                  <Label htmlFor="current_stock">Shelf Stock</Label>
                  <Input
                    type="number"
                    id="current_stock"
                    name="current_stock"
                    value={newProduct.current_stock}
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
                  current_stock: 0,
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
    </div>
  );
};

export default AdminInventory;