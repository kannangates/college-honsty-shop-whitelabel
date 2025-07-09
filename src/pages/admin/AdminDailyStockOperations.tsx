import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Save } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  current_stock: number;
  category: string;
}

interface StockOperation {
  id?: string;
  product_id: string;
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
  product?: Product;
}

const AdminDailyStockOperations = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [operations, setOperations] = useState<StockOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (productsError) throw productsError;

      const { data: existingOperations, error: operationsError } = await supabase
        .from('daily_stock_operations')
        .select('*')
        .eq('date', today);

      if (operationsError) throw operationsError;

      // Merge products with existing operations or create new operations
      const mergedOperations = productsData.map(product => {
        const existingOp = existingOperations?.find(op => op.product_id === product.id);
        return {
          id: existingOp?.id,
          product_id: product.id,
          opening_stock: existingOp?.opening_stock ?? product.current_stock,
          additional_stock: existingOp?.additional_stock ?? 0,
          actual_closing_stock: existingOp?.actual_closing_stock ?? product.current_stock,
          estimated_closing_stock: existingOp?.estimated_closing_stock ?? product.current_stock,
          stolen_stock: existingOp?.stolen_stock ?? 0,
          wastage_stock: existingOp?.wastage_stock ?? 0,
          sales: existingOp?.sales ?? 0,
          order_count: existingOp?.order_count ?? 0,
          created_at: existingOp?.created_at ?? today,
          updated_at: existingOp?.updated_at ?? null,
          product: product
        };
      });

      setProducts(productsData);
      setOperations(mergedOperations);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products and stock data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [today, toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleOperationChange = (productId: string, field: keyof StockOperation, value: number) => {
    if (value < 0) return; // Prevent negative values

    setOperations(prev => 
      prev.map(op => {
        if (op.product_id === productId) {
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
          
          return updatedOp;
        }
        return op;
      })
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Validate all operations
      const hasNegativeValues = operations.some(op => 
        op.additional_stock < 0 || op.sales < 0 || op.stolen_stock < 0 || op.wastage_stock < 0
      );

      if (hasNegativeValues) {
        throw new Error('Negative values are not allowed');
      }

      const operationsToSave = operations.map(({ product, ...op }) => ({
        ...op,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('daily_stock_operations')
        .upsert(operationsToSave, { onConflict: 'id' });

      if (error) throw error;

      // Update product stocks with actual closing stock
      const updates = operations.map(op => 
        supabase
          .from('products')
          .update({ current_stock: op.actual_closing_stock })
          .eq('id', op.product_id)
      );

      await Promise.all(updates);

      toast({
        title: 'Success',
        description: 'Stock operations saved successfully',
      });

      // Reload to get fresh data
      loadProducts();
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading stock operations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Stock Operations</h1>
          <p className="text-muted-foreground">
            Manage daily stock movements and update inventory
          </p>
        </div>
        <Button onClick={handleSaveAll} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save All
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Operations - {new Date(today).toLocaleDateString()}</CardTitle>
          <CardDescription>
            Update stock movements for the day. Closing stock and variance are calculated automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border
           overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Opening Stock</TableHead>
                  <TableHead className="text-right">Additional Stock</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Stolen</TableHead>
                  <TableHead className="text-right">Wastage</TableHead>
                  <TableHead className="text-right font-medium">Estimated Closing</TableHead>
                  <TableHead className="text-right font-medium">Actual Closing</TableHead>
                  <TableHead className="text-right font-medium">Variance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operations.map((operation) => (
                  <TableRow key={operation.product_id}>
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
                        disabled
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
                      operation.actual_closing_stock !== operation.estimated_closing_stock ? 'text-red-500' : ''
                    }`}>
                      {operation.estimated_closing_stock - operation.actual_closing_stock}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDailyStockOperations;
