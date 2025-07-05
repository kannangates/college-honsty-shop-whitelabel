
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
}

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onRestock: (productId: string, quantity: number) => Promise<void>;
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

  const handleSubmit = async () => {
    if (!product) return;
    
    const restockQty = parseInt(quantity);
    if (isNaN(restockQty) || restockQty <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }

    console.log('🔄 Restock request initiated:', {
      productId: product.id,
      productName: product.name,
      currentStock: product.opening_stock,
      restockQuantity: restockQty,
      newStock: product.opening_stock + restockQty,
      timestamp: new Date().toISOString()
    });

    setLoading(true);
    setError('');

    try {
      await onRestock(product.id, restockQty);
      console.log('✅ Restock operation completed successfully:', {
        productId: product.id,
        restockQuantity: restockQty,
        timestamp: new Date().toISOString()
      });
      
      setQuantity('');
      onClose();
    } catch (error) {
      console.error('❌ Restock operation failed:', {
        productId: product.id,
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
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Current Stock</div>
            <div className="text-lg font-semibold">{product.opening_stock} units</div>
          </div>

          <div>
            <Label htmlFor="quantity">Restock Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError('');
              }}
              placeholder="Enter quantity to add"
              className="mt-1"
            />
            {error && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>

          {quantity && !isNaN(parseInt(quantity)) && parseInt(quantity) > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600">New Stock After Restock</div>
              <div className="text-lg font-semibold text-blue-800">
                {product.opening_stock + parseInt(quantity)} units
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
