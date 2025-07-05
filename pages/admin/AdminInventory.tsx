
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Search, Plus, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InventoryTable } from '@/components/admin/InventoryTable';
import { RestockModal } from '@/components/admin/RestockModal';
import { EnhancedEditProductModal } from '@/components/admin/EnhancedEditProductModal';

interface Product {
  id: string;
  name: string;
  unit_price: number;
  opening_stock: number;
  status: string;
  created_at: string;
  sold?: number;
  category?: string;
}

const AdminInventory = () => {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    unit_price: '',
    opening_stock: '',
    status: 'true'
  });
  const { toast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching products from database...');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching products:', error);
        throw error;
      }

      console.log('✅ Products fetched successfully:', {
        count: data?.length || 0,
        products: data?.map(p => ({ id: p.id, name: p.name, stock: p.opening_stock })),
        timestamp: new Date().toISOString()
      });
      
      const transformedData = data?.map(product => ({
        ...product,
        sold: 0,
        category: 'General',
        stock: product.opening_stock
      })) || [];

      setInventory(transformedData);
      
      toast({
        title: 'Success',
        description: `Loaded ${transformedData.length} products`,
      });
    } catch (error) {
      console.error('❌ Error in fetchProducts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    console.log('🔄 Add product request initiated:', {
      productData: newProduct,
      timestamp: new Date().toISOString()
    });

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: newProduct.name,
          unit_price: parseFloat(newProduct.unit_price),
          opening_stock: parseInt(newProduct.opening_stock),
          status: newProduct.status,
          is_archived: false
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Add product database error:', {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      console.log('✅ Product added successfully:', {
        newProduct: data,
        timestamp: new Date().toISOString()
      });

      setInventory(prev => [data, ...prev]);
      setNewProduct({ name: '', unit_price: '', opening_stock: '', status: 'true' });
      setIsAddDialogOpen(false);

      toast({
        title: 'Success',
        description: 'Product added successfully',
      });
    } catch (error) {
      console.error('❌ Error adding product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product',
        variant: 'destructive',
      });
    }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    console.log('🔄 Edit product database request:', {
      productId: updatedProduct.id,
      updateData: {
        name: updatedProduct.name,
        unit_price: updatedProduct.unit_price,
        opening_stock: updatedProduct.opening_stock,
        status: updatedProduct.status
      },
      timestamp: new Date().toISOString()
    });

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: updatedProduct.name,
          unit_price: updatedProduct.unit_price,
          opening_stock: updatedProduct.opening_stock,
          status: updatedProduct.status
        })
        .eq('id', updatedProduct.id);

      if (error) {
        console.error('❌ Edit product database error:', {
          error: error.message,
          code: error.code,
          productId: updatedProduct.id,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      console.log('✅ Product update database response successful:', {
        productId: updatedProduct.id,
        timestamp: new Date().toISOString()
      });

      setInventory(prev => prev.map(p => 
        p.id === updatedProduct.id ? updatedProduct : p
      ));

      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    } catch (error) {
      console.error('❌ Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleRestockProduct = async (productId: string, quantity: number) => {
    const product = inventory.find(p => p.id === productId);
    if (!product) return;

    const newStock = product.opening_stock + quantity;

    console.log('🔄 Restock database request:', {
      productId,
      currentStock: product.opening_stock,
      restockQuantity: quantity,
      newStock,
      timestamp: new Date().toISOString()
    });

    try {
      const { error } = await supabase
        .from('products')
        .update({ opening_stock: newStock })
        .eq('id', productId);

      if (error) {
        console.error('❌ Restock database error:', {
          error: error.message,
          code: error.code,
          productId,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      console.log('✅ Restock database response successful:', {
        productId,
        newStock,
        timestamp: new Date().toISOString()
      });

      setInventory(prev => prev.map(p => 
        p.id === productId ? { ...p, opening_stock: newStock } : p
      ));

      toast({
        title: 'Success',
        description: `Restocked ${product.name} with ${quantity} units`,
      });
    } catch (error) {
      console.error('❌ Error restocking product:', error);
      toast({
        title: 'Error',
        description: 'Failed to restock product',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const filteredInventory = inventory.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalItems: inventory.length,
    lowStock: inventory.filter(p => (p.opening_stock || 0) <= 10).length,
    totalStock: inventory.reduce((sum, p) => sum + (p.opening_stock || 0), 0),
    itemsSold: inventory.reduce((sum, p) => sum + (p.sold || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Package className="h-8 w-8" />
              Inventory Management
            </h1>
            <p className="text-purple-100">Manage stock levels and product availability</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={fetchProducts}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>Create a new product in the inventory</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Unit Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.unit_price}
                      onChange={(e) => setNewProduct({...newProduct, unit_price: e.target.value})}
                      placeholder="Enter unit price"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Opening Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.opening_stock}
                      onChange={(e) => setNewProduct({...newProduct, opening_stock: e.target.value})}
                      placeholder="Enter opening stock"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={newProduct.status}
                      onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddProduct} className="flex-1">
                      Add Product
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStock}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Items Sold</p>
                <p className="text-2xl font-bold text-gray-900">{stats.itemsSold}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">Search Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search by item name..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800">Products Inventory</CardTitle>
          <CardDescription>
            Manage your product inventory with modern table interface
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <InventoryTable
            products={filteredInventory}
            loading={loading}
            onEdit={(product) => {
              setEditingProduct(product);
              setIsEditModalOpen(true);
            }}
            onRestock={(product) => {
              setRestockingProduct(product);
              setIsRestockModalOpen(true);
            }}
          />
        </CardContent>
      </Card>

      {/* Enhanced Edit Product Modal */}
      <EnhancedEditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onUpdate={handleEditProduct}
      />

      {/* Restock Modal */}
      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          setRestockingProduct(null);
        }}
        product={restockingProduct}
        onRestock={handleRestockProduct}
      />
    </div>
  );
};

export default AdminInventory;
