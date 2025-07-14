
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package2, AlertCircle } from 'lucide-react';

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
  onUpdate: (id: string, updates: Partial<Product>) => Promise<void>;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onUpdate
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price || 0,
        image_url: product.image_url || '',
        category: product.category,
        status: product.status,
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.category?.trim()) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!product || !validateForm()) return;
    
    setLoading(true);
    try {
      await onUpdate(product.id, formData);
      onClose();
    } catch (error) {
      console.error('Failed to update product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package2 className="h-6 w-6 text-blue-600" />
            Edit Product
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Update product information for "{product.name}". All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-sm font-medium flex items-center">
                Product Name *
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`h-10 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                disabled={loading}
              />
              {errors.name && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-medium">
                Description
              </Label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="h-10 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price" className="text-sm font-medium flex items-center">
                  Price (₹) *
                </Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className={`h-10 ${errors.price ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                  disabled={loading}
                />
                {errors.price && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.price}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-sm font-medium flex items-center">
                  Category *
                </Label>
                <Input
                  id="edit-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`h-10 ${errors.category ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                  disabled={loading}
                />
                {errors.category && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.category}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image-url" className="text-sm font-medium">
                Image URL
              </Label>
              <Input
                id="edit-image-url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="h-10 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status" className="text-sm font-medium">
                Status
              </Label>
              <select
                id="edit-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full h-10 px-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-shelf-stock" className="text-sm font-medium text-gray-500">
                  Shelf Stock (Read-only)
                </Label>
                <Input
                  id="edit-shelf-stock"
                  value={product.shelf_stock}
                  className="h-10 bg-gray-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-warehouse-stock" className="text-sm font-medium text-gray-500">
                  Warehouse Stock (Read-only)
                </Label>
                <Input
                  id="edit-warehouse-stock"
                  value={product.warehouse_stock}
                  className="h-10 bg-gray-50"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="w-24"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900"
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};