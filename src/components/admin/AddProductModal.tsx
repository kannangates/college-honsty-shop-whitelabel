import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductInput {
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
  category: string;
  status: string;
  shelf_stock: number;
  warehouse_stock: number;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (product: ProductInput) => Promise<void>;
  loading: boolean;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  loading
}) => {
  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    category: '',
    status: 'active',
    shelf_stock: 0,
    warehouse_stock: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        category: '',
        status: 'active',
        shelf_stock: 0,
        warehouse_stock: 0,
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    await onAdd(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Enter details for the new product.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="add-name">Product Name</Label>
            <Input
              id="add-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.name && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">{errors.name}</div>
            )}
          </div>
          <div>
            <Label htmlFor="add-description">Description</Label>
            <Input
              id="add-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="add-price">Price (₹)</Label>
            <Input
              id="add-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className={errors.price ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.price && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">{errors.price}</div>
            )}
          </div>
          <div>
            <Label htmlFor="add-image-url">Image URL</Label>
            <Input
              id="add-image-url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="add-category">Category</Label>
            <Input
              id="add-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="add-status">Status</Label>
            <select
              id="add-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <Label htmlFor="add-shelf-stock">Shelf Stock</Label>
            <Input
              id="add-shelf-stock"
              name="shelf_stock"
              type="number"
              min="0"
              value={formData.shelf_stock}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="add-warehouse-stock">Warehouse Stock</Label>
            <Input
              id="add-warehouse-stock"
              name="warehouse_stock"
              type="number"
              min="0"
              value={formData.warehouse_stock}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#202072] to-[#e66166] text-white"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 