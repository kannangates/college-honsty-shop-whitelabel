import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getCurrentMessages } from '@/config';
import { Loader2, Package, Save } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category: string;
  current_stock: number;
  created_at?: string;
  created_by?: string;
  image_url?: string;
  is_archived?: boolean;
  opening_stock?: number;
  status?: string;
  unit_price?: number;
  [key: string]: any;
}

interface StockOperation {
  id?: string;
  product_id: string;
  product: Product;
  opening_stock: number;
  additional_stock: number;
  actual_closing_stock: number;
  estimated_closing_stock: number;
  stolen_stock: number;
  wastage_stock: number;
  sales: number;
  order_count: number;
  created_at: string;
  updated_at: string | null;
}

interface Filters {
  category: string;
  status: string;
  stockStatus: string;
}

const AdminStockAccounting = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockOperations, setStockOperations] = useState<StockOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    status: 'all',
    stockStatus: 'all',
  });
  const { toast } = useToast();
  const messages = getCurrentMessages();
  const today = new Date().toISOString().split('T')[0];

  const loadStockOperations = useCallback(async () => {
    setLoading(true);
    try {
      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (productsError) throw productsError;

      // Format today's date to match the database format
      const todayFormatted = new Date().toISOString().split('T')[0];
      
      // Load today's operations
      const { data: operationsData, error: operationsError } = await supabase
        .from('daily_stock_operations')
        .select('*')
        .eq('created_at', todayFormatted);

      if (operationsError) throw operationsError;

      // Transform products and merge with operations
      const transformedProducts = (productsData || []).map(item => ({
        ...item,
        current_stock: item.current_stock || 0,
      }));

      // Create or update operations for each product
      const mergedOperations = transformedProducts.map(product => {
        const existingOp = operationsData?.find((op: any) => op.product_id === product.id);
        return {
          id: existingOp?.id,
          product_id: product.id,
          product,
          opening_stock: existingOp?.opening_stock ?? product.current_stock,
          additional_stock: existingOp?.additional_stock ?? 0,
          actual_closing_stock: existingOp?.actual_closing_stock ?? product.current_stock,
          estimated_closing_stock: existingOp?.estimated_closing_stock ?? product.current_stock,
          stolen_stock: existingOp?.stolen_stock ?? 0,
          wastage_stock: existingOp?.wastage_stock ?? 0,
          sales: existingOp?.sales ?? 0,
          order_count: existingOp?.order_count ?? 0,
          created_at: existingOp?.created_at ?? today,
          updated_at: existingOp?.updated_at,
        } as StockOperation;
      });

      setProducts(transformedProducts);
      setStockOperations(mergedOperations);
    } catch (error) {
      console.error('Error loading stock operations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stock operations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, today]);

  const applyFilters = useCallback(() => {
    let filtered = [...stockOperations];
    
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(op => op.product?.category === filters.category);
    }
    
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(op => op.product?.status === filters.status);
    }
    
    if (filters.stockStatus && filters.stockStatus !== 'all') {
      if (filters.stockStatus === 'low') {
        filtered = filtered.filter(op => (op.opening_stock || 0) < 10);
      } else if (filters.stockStatus === 'out') {
        filtered = filtered.filter(op => (op.opening_stock || 0) === 0);
      }
    }
    
    return filtered;
  }, [stockOperations, filters]);

  useEffect(() => {
    loadStockOperations();
  }, [loadStockOperations]);

  const filteredOperations = applyFilters();

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const updateOperation = useCallback((id: string, updates: Partial<StockOperation>) => {
    setStockOperations(prev =>
      prev.map(op => (op.id === id ? { ...op, ...updates } : op))
    );
  }, []);

  const handleOperationChange = (productId: string, field: keyof StockOperation, value: number) => {
    const op = stockOperations.find(op => op.product_id === productId);
    if (!op) return;

    const updatedOp = { ...op, [field]: value };
          
    // Recalculate estimated closing stock
    if (['additional_stock', 'sales', 'stolen_stock', 'wastage_stock'].includes(field)) {
      updatedOp.estimated_closing_stock = 
        updatedOp.opening_stock + 
        updatedOp.additional_stock - 
        updatedOp.sales - 
        updatedOp.stolen_stock - 
        updatedOp.wastage_stock;
              
      // Auto-update actual closing stock if it matches the previous estimated value
      if (op.actual_closing_stock === op.estimated_closing_stock) {
        updatedOp.actual_closing_stock = updatedOp.estimated_closing_stock;
      }
    }
          
    updateOperation(op.id!, updatedOp);
  };

  const handleSave = useCallback(async () => {
    if (!stockOperations.length) return;

    setSaving(true);
    try {
      const operationsToSave = stockOperations.map(op => ({
        id: op.id,
        product_id: op.product_id,
        opening_stock: Number(op.opening_stock) || 0,
        additional_stock: Number(op.additional_stock) || 0,
        actual_closing_stock: Number(op.actual_closing_stock) || 0,
        estimated_closing_stock: Number(op.estimated_closing_stock) || 0,
        stolen_stock: Number(op.stolen_stock) || 0,
        wastage_stock: Number(op.wastage_stock) || 0,
        sales: Number(op.sales) || 0,
        order_count: Number(op.order_count) || 0,
        created_at: op.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('daily_stock_operations')
        .upsert(operationsToSave, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Stock operations saved successfully',
      });

      // Reload to get fresh data
      loadStockOperations();
    } catch (error) {
      console.error('Error saving operations:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save stock operations',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading stock operations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Package className="h-8 w-8" />
            Stock Accounting
          </h1>
          <p className="text-purple-100">Manage and monitor product stock levels and daily operations</p>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Daily Stock Operations - {new Date(today).toLocaleDateString()}
            </CardTitle>
            <CardDescription>Monitor and update daily stock movements</CardDescription>
          </div>
          <Button 
            onClick={handleSave}
            disabled={saving || !stockOperations.length}
            className="w-full sm:w-auto"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={filters.category}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {[...new Set(products.map(p => p.category))].map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stockStatus">Stock Status</Label>
              <Select 
                value={filters.stockStatus}
                onValueChange={(value) => handleFilterChange('stockStatus', value)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Stock Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Levels</SelectItem>
                  <SelectItem value="low">Low Stock (Less than 10)</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Opening</TableHead>
                  <TableHead className="text-right">Added</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Stolen</TableHead>
                  <TableHead className="text-right">Wastage</TableHead>
                  <TableHead className="text-right font-medium">Est. Closing</TableHead>
                  <TableHead className="text-right font-medium">Actual Closing</TableHead>
                  <TableHead className="text-right font-medium">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOperations.map((operation) => (
                  <TableRow key={`${operation.product_id}-${operation.created_at}`}>
                    <TableCell className="font-medium">
                      {operation.product?.name || 'Unknown Product'}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={operation.opening_stock}
                        onChange={(e) => handleOperationChange(operation.product_id, 'opening_stock', Number(e.target.value))}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={operation.additional_stock}
                        onChange={(e) => handleOperationChange(operation.product_id, 'additional_stock', Number(e.target.value))}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={operation.sales}
                        onChange={(e) => handleOperationChange(operation.product_id, 'sales', Number(e.target.value))}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={operation.stolen_stock}
                        onChange={(e) => handleOperationChange(operation.product_id, 'stolen_stock', Number(e.target.value))}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={operation.wastage_stock}
                        onChange={(e) => handleOperationChange(operation.product_id, 'wastage_stock', Number(e.target.value))}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {operation.estimated_closing_stock}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={operation.actual_closing_stock}
                        onChange={(e) => handleOperationChange(operation.product_id, 'actual_closing_stock', Number(e.target.value))}
                        className="text-right"
                      />
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      operation.estimated_closing_stock !== operation.actual_closing_stock 
                        ? 'text-red-500 font-bold' 
                        : ''
                    }`}>
                      {operation.estimated_closing_stock - operation.actual_closing_stock}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredOperations.length === 0 && (
            <div className="text-center py-4">
              <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No products match the selected filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStockAccounting;
