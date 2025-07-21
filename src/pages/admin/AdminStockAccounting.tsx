import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { WHITELABEL_CONFIG } from '@/config';
import { Loader2, Save } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Product as stored in DB
interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category: string;
  shelf_stock: number;
  warehouse_stock: number;
  created_at?: string;
  created_by?: string;
  image_url?: string;
  is_archived?: boolean;
  opening_stock?: number;
  status?: string;
  unit_price?: number;
  updated_by?: string;
  updated_at?: string;
  [key: string]: string | number | boolean | undefined;
}

// Stock operation as stored in DB (no product field)
interface StockOperationRow {
  id?: string;
  product_id: string;
  opening_stock: number;
  additional_stock: number;
  actual_closing_stock: number;
  estimated_closing_stock: number;
  stolen_stock: number;
  wastage_stock: number;
  warehouse_stock: number;
  sales: number;
  order_count: number;
  created_at: string;
  updated_at?: string | null;
}

// Stock operation as used in UI (with product field)
interface StockOperation extends StockOperationRow {
  product: Product;
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
  const errorMessages = WHITELABEL_CONFIG.messages.errors;
  const authMessages = WHITELABEL_CONFIG.messages.auth;
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

      // Type assertion for operationsData with proper handling
      const opsData: StockOperationRow[] = (operationsData ?? []).map((op: any) => ({
        ...op,
        updated_at: op.updated_at || null,
        warehouse_stock: op.warehouse_stock || 0
      }));

      // Transform products and merge with operations
      const transformedProducts = (productsData ?? []).map(item => ({
        ...item,
        shelf_stock: item.shelf_stock || 0,
        warehouse_stock: item.warehouse_stock || 0,
      }));
      console.log('Products:', transformedProducts); // Debug: log all products

      // Create or update operations for each product
      // This ensures all products are shown, even if they have no stock operation today
      const mergedOperations: StockOperation[] = transformedProducts.map(product => {
        const existingOp = opsData.find(op => op.product_id === product.id);
        return {
          id: existingOp?.id,
          product_id: product.id,
          product,
          opening_stock: existingOp?.opening_stock ?? product.shelf_stock,
          additional_stock: existingOp?.additional_stock ?? 0,
          actual_closing_stock: existingOp?.actual_closing_stock ?? product.shelf_stock,
          estimated_closing_stock: existingOp?.estimated_closing_stock ?? product.shelf_stock,
          stolen_stock: existingOp?.stolen_stock ?? 0,
          wastage_stock: existingOp?.wastage_stock ?? 0,
          warehouse_stock: existingOp?.warehouse_stock ?? product.warehouse_stock,
          sales: existingOp?.sales ?? 0,
          order_count: existingOp?.order_count ?? 0,
          created_at: existingOp?.created_at ?? today,
          updated_at: existingOp?.updated_at ?? null,
        };
      });
      console.log('Merged Operations:', mergedOperations); // Debug: log merged operations

      setProducts(transformedProducts);
      setStockOperations(mergedOperations);
    } catch (error) {
      console.error('Error loading stock operations:', error);
      toast({
        title: 'Error',
        description: errorMessages.failedToLoadStockOperations,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast, today, errorMessages]);

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
  console.log('Filtered Operations:', filteredOperations); // Debug: log filtered operations before rendering

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const updateOperation = useCallback((id: string | undefined, updates: Partial<StockOperation>) => {
    setStockOperations(prev =>
      prev.map(op => (op.id === id ? { ...op, ...updates } : op))
    );
  }, []);

  const handleOperationChange = (productId: string, field: keyof StockOperation, value: number) => {
    const op = stockOperations.find(op => op.product_id === productId);
    if (!op) return;

    const updatedOp: StockOperation = { ...op, [field]: value };

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

    updateOperation(op.id, updatedOp);
  };

  const handleSave = useCallback(async () => {
    if (!stockOperations.length) return;

    setSaving(true);
    try {
      const operationsToSave: StockOperationRow[] = stockOperations.map(({ product, ...op }) => ({
        ...op,
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

      // Update product stocks with actual closing stock
      const updates = stockOperations.map(op =>
        supabase
          .from('products')
          .update({ shelf_stock: op.actual_closing_stock })
          .eq('id', op.product_id)
      );

      await Promise.all(updates);

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
        description: error instanceof Error ? error.message : errorMessages.failedToSaveStockOperations,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }, [stockOperations, toast, loadStockOperations, errorMessages]);

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
      <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-semibold">Admin Stock Accounting</h1>
        <p className="text-sm">Manage the stock operations for today</p>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-3 gap-4">
        <Select
          value={filters.category}
          onValueChange={(value) => handleFilterChange('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Array.from(new Set(products.map(p => p.category))).map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Array.from(new Set(products.map(p => p.status?.toString() || 'active'))).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.stockStatus}
          onValueChange={(value) => handleFilterChange('stockStatus', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock Status</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Operations</CardTitle>
          <CardDescription>Today's stock accounting overview</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Opening Stock</TableCell>
                <TableCell>Additional Stock</TableCell>
                <TableCell>Estimated Closing Stock</TableCell>
                <TableCell>Actual Closing Stock</TableCell>
                <TableCell>Wastage</TableCell>
                <TableCell>Stolen Stock</TableCell>
                <TableCell>Sales</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperations.map((operation) => {
                // Calculate sales as order_count * product.price
                const sales = (operation.order_count || 0) * (operation.product?.price || 0);
                // Calculate estimated closing stock
                const estimatedClosingStock =
                  (operation.opening_stock || 0) +
                  (operation.additional_stock || 0) -
                  sales;
                // Calculate stolen stock as estimated_closing_stock - actual_closing_stock - wastage_stock
                const stolenStock =
                  estimatedClosingStock - (operation.actual_closing_stock || 0) - (operation.wastage_stock || 0);
                return (
                <TableRow key={`${operation.product_id}-${operation.created_at}`}>
                  <TableCell className="font-medium">
                    {operation.product?.name || 'Unknown Product'}
                  </TableCell>
                    <TableCell>{operation.opening_stock}</TableCell>
                    <TableCell>{operation.additional_stock}</TableCell>
                    <TableCell className="text-right font-medium">{estimatedClosingStock}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                        value={operation.actual_closing_stock}
                        onChange={(e) => handleOperationChange(operation.product_id, 'actual_closing_stock', Number(e.target.value))}
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
                    <TableCell className="text-right font-medium">{stolenStock}</TableCell>
                    <TableCell>{sales}</TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="default"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          {saving ? 'Saving...' : 'Save Operations'}
        </Button>
      </div>
    </div>
  );
};

export default AdminStockAccounting;
