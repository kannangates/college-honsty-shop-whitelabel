import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/features/gamification/components/badge';
import { useStockManagement } from '@/hooks/useStockManagement';
import { Loader2, Package, Warehouse } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  warehouse_stock: number | null;
  shelf_stock: number | null;
}

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onStockUpdated: () => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  product,
  onStockUpdated
}) => {
  const [isShelfRestock, setIsShelfRestock] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [currentWarehouseStock, setCurrentWarehouseStock] = useState(0);
  const [currentShelfStock, setCurrentShelfStock] = useState(0);
  
  const { isLoading, restockWarehouse, restockShelf, getStockStatus } = useStockManagement();

  useEffect(() => {
    if (product && isOpen) {
      setCurrentWarehouseStock(product.warehouse_stock || 0);
      setCurrentShelfStock(product.shelf_stock || 0);
      setQuantity('');
      setIsShelfRestock(false);
      
      // Refresh stock status
      getStockStatus(product.id).then(response => {
        if (response.success && response.data) {
          const stockData = response.data as { warehouse_stock?: number; shelf_stock?: number };
          setCurrentWarehouseStock(stockData.warehouse_stock ?? 0);
          setCurrentShelfStock(stockData.shelf_stock ?? 0);
        }
      });
    }
  }, [product, isOpen, getStockStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !quantity || parseInt(quantity) <= 0) {
      return;
    }

    const qty = parseInt(quantity);
    let result;

    if (isShelfRestock) {
      result = await restockShelf(product.id, qty);
    } else {
      result = await restockWarehouse(product.id, qty);
    }

    if (result.success) {
      // Update current stock values with the new data
      if (result.data) {
        setCurrentWarehouseStock(result.data.warehouse_stock || 0);
        setCurrentShelfStock(result.data.shelf_stock || 0);
      }
      setQuantity('');
      onStockUpdated();
      onClose();
    }
  };

  const maxShelfQuantity = isShelfRestock ? currentWarehouseStock : undefined;
  const quantityNum = parseInt(quantity) || 0;
  const isValidQuantity = quantityNum > 0 && (!isShelfRestock || quantityNum <= currentWarehouseStock);

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Restock Product
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm">{product.name}</h4>
            <div className="flex gap-4 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <Warehouse className="h-4 w-4 text-muted-foreground" />
                <span>Warehouse: </span>
                <Badge variant="outline">{currentWarehouseStock}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>Shelf: </span>
                <Badge variant="outline">{currentShelfStock}</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Stock Type</Label>
              <p className="text-xs text-muted-foreground">
                {isShelfRestock ? 'Move from warehouse to shelf' : 'Add to warehouse'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="stock-type" className="text-sm">
                {isShelfRestock ? 'Shelf' : 'Warehouse'}
              </Label>
              <Switch
                id="stock-type"
                checked={isShelfRestock}
                onCheckedChange={setIsShelfRestock}
              />
            </div>
          </div>

          {isShelfRestock && currentWarehouseStock === 0 && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">
                No warehouse stock available for shelf restocking.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                min="1"
                max={maxShelfQuantity}
                disabled={isShelfRestock && currentWarehouseStock === 0}
              />
              {isShelfRestock && maxShelfQuantity !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum available from warehouse: {maxShelfQuantity}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!isValidQuantity || isLoading || (isShelfRestock && currentWarehouseStock === 0)}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isShelfRestock ? 'Move to Shelf' : 'Add to Warehouse'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};