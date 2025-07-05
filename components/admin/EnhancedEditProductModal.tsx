
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Package } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  unit_price: number;
  opening_stock: number;
  status: string;
}

interface EnhancedEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdate: (product: Product) => Promise<void>;
}

export const EnhancedEditProductModal: React.FC<EnhancedEditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    name: '',
    unit_price: '',
    opening_stock: '',
    status: 'true'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      console.log('📝 Edit modal opened for product:', {
        productId: product.id,
        productName: product.name,
        currentData: product,
        timestamp: new Date().toISOString()
      });

      setFormData({
        name: product.name,
        unit_price: product.unit_price.toString(),
        opening_stock: product.opening_stock.toString(),
        status: product.status
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.unit_price || parseFloat(formData.unit_price) <= 0) {
      newErrors.unit_price = 'Valid unit price is required';
    }

    if (!formData.opening_stock || parseInt(formData.opening_stock) < 0) {
      newErrors.opening_stock = 'Stock must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!product || !validateForm()) return;

    const updatedProduct: Product = {
      ...product,
      name: formData.name.trim(),
      unit_price: parseFloat(formData.unit_price),
      opening_stock: parseInt(formData.opening_stock),
      status: formData.status
    };

    console.log('🔄 Product update request initiated:', {
      productId: product.id,
      originalData: product,
      updatedData: updatedProduct,
      changes: {
        nameChanged: product.name !== updatedProduct.name,
        priceChanged: product.unit_price !== updatedProduct.unit_price,
        stockChanged: product.opening_stock !== updatedProduct.opening_stock,
        statusChanged: product.status !== updatedProduct.status
      },
      timestamp: new Date().toISOString()
    });

    setLoading(true);

    try {
      await onUpdate(updatedProduct);
      console.log('✅ Product update completed successfully:', {
        productId: product.id,
        updatedData: updatedProduct,
        timestamp: new Date().toISOString()
      });
      
      onClose();
    } catch (error) {
      console.error('❌ Product update failed:', {
        productId: product.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        attemptedData: updatedProduct,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Edit Product
          </DialogTitle>
          <DialogDescription>
            Update product information for "{product.name}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Product Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="edit-price">Unit Price (₹)</Label>
            <Input
              id="edit-price"
              type="number"
              min="0"
              step="0.01"
              value={formData.unit_price}
              onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
              className={errors.unit_price ? 'border-red-500' : ''}
            />
            {errors.unit_price && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.unit_price}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="edit-stock">Opening Stock</Label>
            <Input
              id="edit-stock"
              type="number"
              min="0"
              value={formData.opening_stock}
              onChange={(e) => setFormData({...formData, opening_stock: e.target.value})}
              className={errors.opening_stock ? 'border-red-500' : ''}
            />
            {errors.opening_stock && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.opening_stock}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="edit-status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#202072] to-[#e66166] text-white"
            >
              {loading ? 'Updating...' : 'Save Changes'}
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
