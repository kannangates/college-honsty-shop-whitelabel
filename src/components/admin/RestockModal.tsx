
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package2, AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  opening_stock: number;
  warehouse_stock: number;
  shelf_stock: number;
}

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onRestock: (productId: string, quantity: number, restockType: 'warehouse' | 'shelf') => Promise<void>;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  product,
  onRestock
}) => {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [restockType, setRestockType] = useState<'warehouse' | 'shelf'>('warehouse');

  const handleSubmit = async () => {
    if (!product) return;
    
    const restockQty = parseInt(quantity);
    if (isNaN(restockQty) || restockQty <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }

    // Validation for shelf restock
    if (restockType === 'shelf' && restockQty > product.warehouse_stock) {
      setError(`Cannot restock ${restockQty} units to shelf. Only ${product.warehouse_stock} units available in warehouse.`);
      return;
    }

    console.log('🔄 Restock request initiated:', {
      productId: product.id,
      productName: product.name,
      restockType,
      currentWarehouseStock: product.warehouse_stock,
      currentShelfStock: product.shelf_stock,
      restockQuantity: restockQty,
      timestamp: new Date().toISOString()
    });

    setLoading(true);
    setError('');

    try {
      await onRestock(product.id, restockQty, restockType);
      console.log('✅ Restock operation completed successfully:', {
        productId: product.id,
        restockType,
        restockQuantity: restockQty,
        timestamp: new Date().toISOString()
      });
      
      setQuantity('');
      onClose();
    } catch (error) {
      console.error('❌ Restock operation failed:', {
        productId: product.id,
        restockType,
        restockQuantity: restockQty,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      setError('Failed to restock product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuantity('');
    setError('');
    setRestockType('warehouse');
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5 text-blue-600" />
            Restock Product
          </DialogTitle>
          <DialogDescription>
            Add more stock for "{product.name}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Warehouse Stock</div>
              <div className="text-lg font-semibold">{product.warehouse_stock} units</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Shelf Stock</div>
              <div className="text-lg font-semibold">{product.shelf_stock} units</div>
            </div>
          </div>

          <div>
            <Label>Restock Type</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant={restockType === 'warehouse' ? 'default' : 'outline'}
                onClick={() => {
                  setRestockType('warehouse');
                  setError('');
                }}
                className="flex-1"
                size="sm"
              >
                Warehouse
              </Button>
              <Button
                type="button"
                variant={restockType === 'shelf' ? 'default' : 'outline'}
                onClick={() => {
                  setRestockType('shelf');
                  setError('');
                }}
                className="flex-1"
                size="sm"
              >
                Shelf
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {restockType === 'warehouse' 
                ? 'Add new stock to warehouse inventory' 
                : 'Move stock from warehouse to shelf (reduces warehouse stock)'}
            </p>
          </div>

          <div>
            <Label htmlFor="quantity">Restock Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={restockType === 'shelf' ? product.warehouse_stock : undefined}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError('');
              }}
              placeholder={`Enter quantity to ${restockType === 'warehouse' ? 'add' : 'move to shelf'}`}
              className="mt-1"
            />
            {restockType === 'shelf' && (
              <p className="text-xs text-gray-500 mt-1">
                Available in warehouse: {product.warehouse_stock} units
              </p>
            )}
            {error && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>

          {quantity && !isNaN(parseInt(quantity)) && parseInt(quantity) > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600">Stock After Restock</div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <div className="text-xs text-blue-600">Warehouse</div>
                  <div className="text-lg font-semibold text-blue-800">
                    {restockType === 'warehouse' 
                      ? product.warehouse_stock + parseInt(quantity)
                      : Math.max(0, product.warehouse_stock - parseInt(quantity))
                    } units
                  </div>
                </div>
                <div>
                  <div className="text-xs text-blue-600">Shelf</div>
                  <div className="text-lg font-semibold text-blue-800">
                    {restockType === 'shelf' 
                      ? product.shelf_stock + parseInt(quantity)
                      : product.shelf_stock
                    } units
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={loading || !quantity || parseInt(quantity) <= 0}
              className="flex-1 bg-gradient-to-r from-[#202072] to-[#e66166] text-white"
            >
              {loading ? 'Restocking...' : 'Confirm Restock'}
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
