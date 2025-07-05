
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { InventoryFilters } from "@/components/admin/InventoryFilters";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Calendar, Save, RefreshCw } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StockRow {
  id: string | null;
  product: string;
  product_id: string;
  category: string;
  orderCount: number;
  openingStock: number;
  additionalStock: number;
  actualClosingStock: number;
  wastedStock: number;
  unitPrice: number;
  estimatedClosingStock: number;
  stolenStock: number;
  sales: number;
}

const AdminStockAccounting: React.FC = () => {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  
  const { toast } = useToast();

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    loadProductsForAccounting();
  }, [selectedDate]);

  useEffect(() => {
    applyFilters();
  }, [rows, selectedCategory, showLowStock]);

  const applyFilters = () => {
    let filtered = [...rows];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(row => row.category === selectedCategory);
    }

    if (showLowStock) {
      filtered = filtered.filter(row => row.actualClosingStock <= 5);
    }

    setFilteredRows(filtered);
  };

  // Improved product loading logic - load ALL products first, then populate data
  const loadProductsForAccounting = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading ALL products for stock accounting for date:', selectedDate);
      
      // Step 1: Load ALL non-archived products first
      const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('id, name, unit_price, opening_stock, category')
        .eq('is_archived', false)
        .order('name');

      if (productsError) {
        console.error('❌ Error loading products:', productsError);
        throw productsError;
      }

      console.log(`📦 Loaded ${allProducts.length} products from database`);

      // Step 2: Get existing daily inventory records for the selected date
      const { data: existingInventory, error: inventoryError } = await supabase
        .from('daily_inventory')
        .select('*')
        .gte('created_at', `${selectedDate}T00:00:00`)
        .lt('created_at', `${selectedDate}T23:59:59`);

      if (inventoryError) {
        console.error('❌ Error loading inventory:', inventoryError);
        throw inventoryError;
      }

      console.log(`📊 Found ${existingInventory?.length || 0} existing inventory records`);

      // Step 3: Create inventory map for quick lookup
      const inventoryMap = new Map();
      existingInventory?.forEach(item => {
        inventoryMap.set(item.product_id, item);
      });

      // Step 4: Extract unique categories
      const uniqueCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);

      // Step 5: Create stock rows for ALL products
      const stockRows: StockRow[] = allProducts.map(product => {
        const existingData = inventoryMap.get(product.id);
        
        // Use existing data if available, otherwise default to 0
        const orderCount = existingData?.order_count || 0;
        const additionalStock = existingData?.additional_stock || 0;
        const actualClosingStock = existingData?.actual_closing_stock || 0;
        const wastedStock = existingData?.wastage_stock || 0;
        
        // Calculate derived values
        const estimatedClosingStock = product.opening_stock + additionalStock - orderCount;
        const stolenStock = Math.max(0, estimatedClosingStock - (actualClosingStock + wastedStock));
        const sales = orderCount * product.unit_price;

        return {
          id: existingData?.id || null,
          product: product.name,
          product_id: product.id,
          category: product.category || 'Uncategorized',
          orderCount,
          openingStock: product.opening_stock,
          additionalStock,
          actualClosingStock,
          wastedStock,
          unitPrice: product.unit_price,
          estimatedClosingStock,
          stolenStock,
          sales
        };
      });

      console.log(`✅ Created stock accounting rows for ${stockRows.length} products`);
      setRows(stockRows);
      
      toast({
        title: 'Success',
        description: `Loaded ${stockRows.length} products for stock accounting`,
      });
    } catch (error) {
      console.error('❌ Error in loadProductsForAccounting:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: string, field: keyof StockRow, value: number) => {
    const updated = rows.map((row) =>
      row.id === id || row.product_id === id ? { ...row, [field]: value } : row
    );
    
    const recalculated = updated.map((row) => {
      const estimatedClosingStock = row.openingStock + row.additionalStock - row.orderCount;
      const stolenStock = Math.max(0, estimatedClosingStock - (row.actualClosingStock + row.wastedStock));
      const sales = row.orderCount * row.unitPrice;
      
      return {
        ...row,
        estimatedClosingStock,
        stolenStock,
        sales
      };
    });
    
    setRows(recalculated);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      console.log('💾 Saving changes for date:', selectedDate);
      
      const saveData = rows.map(row => ({
        product_id: row.product_id,
        opening_stock: row.openingStock,
        additional_stock: row.additionalStock,
        actual_closing_stock: row.actualClosingStock,
        wastage_stock: row.wastedStock,
        order_count: row.orderCount,
        estimated_closing_stock: row.estimatedClosingStock,
        stolen_stock: row.stolenStock,
        sales: row.sales
      }));

      const { data, error } = await supabase.functions.invoke('daily-inventory-operations', {
        body: { 
          operation: 'save',
          data: saveData,
          date: selectedDate 
        }
      });

      if (error) throw error;

      console.log('✅ Save successful:', data);
      toast({
        title: 'Save Successful',
        description: 'Inventory data saved successfully',
      });

      // Reload data to get the updated records with IDs
      await loadProductsForAccounting();
    } catch (error) {
      console.error('❌ Save failed:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save inventory data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const lowStockCount = rows.filter(row => row.actualClosingStock <= 5).length;

  return (
    <div className="space-y-6 text-left">
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl">
        <h1 className="text-3xl font-bold">Daily Stock Accounting</h1>
        <p className="text-sm text-purple-100 mt-1">
          Track wasted, closing, and stolen stock effectively.
        </p>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Stock Accounting For {currentDate}
          </h2>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={loadProductsForAccounting}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            onClick={saveChanges}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
            Save All Changes
          </Button>
        </div>
      </div>

      <InventoryFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        showLowStock={showLowStock}
        onLowStockToggle={() => setShowLowStock(!showLowStock)}
        categories={categories}
        lowStockCount={lowStockCount}
      />

      <Card className="p-6 shadow-md rounded-2xl">
        <div className="w-full overflow-x-auto rounded-xl border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="font-medium text-gray-700 text-left">Product</TableHead>
                <TableHead className="font-medium text-gray-700 text-left">Category</TableHead>
                <TableHead className="text-left font-medium text-gray-700">Order Count</TableHead>
                <TableHead className="text-left font-medium text-gray-700">Opening Stock</TableHead>
                <TableHead className="text-left font-medium text-gray-700">Additional Stock</TableHead>
                <TableHead className="text-left font-medium text-gray-700">Estimated Closing Stock</TableHead>
                <TableHead className="text-left font-medium text-gray-700">Actual Closing Stock</TableHead>
                <TableHead className="text-left font-medium text-gray-700">Wasted Stock</TableHead>
                <TableHead className="text-left font-medium text-gray-700">Stolen Stock</TableHead>
                <TableHead className="text-left font-medium text-gray-700">Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading all products for {selectedDate}...
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    No products found matching current filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => (
                  <TableRow key={row.product_id} className="hover:bg-gray-50 transition-colors duration-200">
                    <TableCell className="whitespace-normal break-words font-medium text-left">
                      {row.product}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 text-left">
                      {row.category}
                    </TableCell>
                    <TableCell className="text-left">
                      <Input
                        type="number"
                        value={row.orderCount}
                        onChange={(e) =>
                          handleChange(
                            row.product_id,
                            "orderCount",
                            Number(e.target.value)
                          )
                        }
                        className="h-8 min-w-[80px] text-sm text-left"
                      />
                    </TableCell>
                    <TableCell className="text-left font-medium">
                      {row.openingStock}
                    </TableCell>
                    <TableCell className="text-left">
                      <Input
                        type="number"
                        value={row.additionalStock}
                        onChange={(e) =>
                          handleChange(
                            row.product_id,
                            "additionalStock",
                            Number(e.target.value)
                          )
                        }
                        className="h-8 min-w-[80px] text-sm text-left"
                      />
                    </TableCell>
                    <TableCell className="text-left font-medium">
                      {row.estimatedClosingStock}
                    </TableCell>
                    <TableCell className="text-left">
                      <Input
                        type="number"
                        value={row.actualClosingStock}
                        onChange={(e) =>
                          handleChange(
                            row.product_id,
                            "actualClosingStock",
                            Number(e.target.value)
                          )
                        }
                        className={`h-8 min-w-[80px] text-sm text-left ${
                          row.actualClosingStock <= 5 ? 'border-red-300 bg-red-50' : ''
                        }`}
                      />
                    </TableCell>
                    <TableCell className="text-left">
                      <Input
                        type="number"
                        value={row.wastedStock}
                        onChange={(e) =>
                          handleChange(
                            row.product_id,
                            "wastedStock",
                            Number(e.target.value)
                          )
                        }
                        className="h-8 min-w-[80px] text-sm text-left"
                      />
                    </TableCell>
                    <TableCell className="text-left font-medium text-red-600">
                      {row.stolenStock}
                    </TableCell>
                    <TableCell className="text-left font-medium text-green-600">
                      {row.sales.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default AdminStockAccounting;
