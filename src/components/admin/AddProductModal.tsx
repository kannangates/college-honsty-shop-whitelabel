import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package2, AlertCircle } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '@/constants/productCategories';

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
    if (!formData.category.trim()) newErrors.category = 'Category is required';
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
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package2 className="h-6 w-6 text-blue-600" />
            Add New Product
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Enter the details for the new product. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="add-name" className="text-sm font-medium flex items-center">
                Product Name *
              </Label>
              <Input
                id="add-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`h-10 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                disabled={loading}
                placeholder="Enter product name"
              />
              {errors.name && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-description" className="text-sm font-medium">
                Description
              </Label>
              <Input
                id="add-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter product description"
                className="h-10 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-price" className="text-sm font-medium flex items-center">
                  Price (₹) *
                </Label>
                <Input
                  id="add-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className={`h-10 ${errors.price ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                  disabled={loading}
                  placeholder="0.00"
                />
                {errors.price && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.price}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-category" className="text-sm font-medium flex items-center">
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, category: value }));
                    if (errors.category) {
                      setErrors(prev => ({ ...prev, category: '' }));
                    }
                  }}
                  disabled={loading}
                >
                  <SelectTrigger className={`h-10 ${errors.category ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.category}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-image-url" className="text-sm font-medium">
                Image URL
              </Label>
              <Input
                id="add-image-url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter image URL"
                className="h-10 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-status" className="text-sm font-medium">
                Status
              </Label>
              <select
                id="add-status"
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
                <Label htmlFor="add-shelf-stock" className="text-sm font-medium">
                  Shelf Stock
                </Label>
                <Input
                  id="add-shelf-stock"
                  name="shelf_stock"
                  type="number"
                  min="0"
                  value={formData.shelf_stock}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-10 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-warehouse-stock" className="text-sm font-medium">
                  Warehouse Stock
                </Label>
                <Input
                  id="add-warehouse-stock"
                  name="warehouse_stock"
                  type="number"
                  min="0"
                  value={formData.warehouse_stock}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-10 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
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
            {loading ? "Adding..." : "Add"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 