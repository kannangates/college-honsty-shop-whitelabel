
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
  category: string;
  status: string;
  shelf_stock: number;
  warehouse_stock: number;
  created_at: string;
  is_archived: boolean;
  updated_by?: string;
  updated_at?: string;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdate: (product: Product) => Promise<void>;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onUpdate
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    status: 'active',
    shelf_stock: '',
    warehouse_stock: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        image_url: product.image_url || '',
        category: product.category || '',
        status: product.status || 'active',
        shelf_stock: product.shelf_stock?.toString() || '',
        warehouse_stock: product.warehouse_stock?.toString() || '',
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!product || !validateForm()) return;
    const updatedProduct: Product = {
      ...product,
      name: formData.name.trim(),
      description: formData.description,
      price: parseFloat(formData.price),
      image_url: formData.image_url,
      category: formData.category,
      status: formData.status,
      shelf_stock: product.shelf_stock, // keep as original, not editable
      warehouse_stock: product.warehouse_stock, // keep as original, not editable
    };
    setLoading(true);
    try {
      await onUpdate(updatedProduct);
      onClose();
    } catch (error) {
      // Optionally handle error
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
          <DialogTitle>Edit Product</DialogTitle>
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
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">{errors.name}</div>
            )}
          </div>
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="edit-price">Price (₹)</Label>
            <Input
              id="edit-price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className={errors.price ? 'border-red-500' : ''}
            />
            {errors.price && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">{errors.price}</div>
            )}
          </div>
          <div>
            <Label htmlFor="edit-image-url">Image URL</Label>
            <Input
              id="edit-image-url"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="edit-category">Category</Label>
            <Input
              id="edit-category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="edit-status">Status</Label>
            <select
              id="edit-status"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <Label htmlFor="edit-shelf-stock">Shelf Stock</Label>
            <Input
              id="edit-shelf-stock"
              type="number"
              min="0"
              value={formData.shelf_stock}
              disabled
            />
          </div>
          <div>
            <Label htmlFor="edit-warehouse-stock">Warehouse Stock</Label>
            <Input
              id="edit-warehouse-stock"
              type="number"
              min="0"
              value={formData.warehouse_stock}
              disabled
            />
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