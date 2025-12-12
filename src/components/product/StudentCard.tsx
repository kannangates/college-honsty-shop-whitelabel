import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/features/gamification/components/badge';
import { Button } from '@/components/ui/button';
import { Package, Pencil, Plus, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  unit_price: number;
  opening_stock: number;
  warehouse_stock: number;
  shelf_stock: number;
  status: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  image_url?: string;
  updated_by?: string;
}

interface StudentCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onRestock?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  product,
  onEdit,
  onRestock,
  onAddToCart
}) => {
  const getStockBadgeVariant = (stock: number) => {
    if (stock === 0) return 'destructive';
    if (stock < 10) return 'secondary';
    return 'default';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default'; // This should be green
      case 'inactive':
      case 'disabled':
        return 'destructive'; // This should be red
      case 'pending':
        return 'secondary'; // This should be yellow/gray
      default:
        return 'outline';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'inactive':
      case 'disabled':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
  };

  const totalStock = (product.warehouse_stock || 0) + (product.shelf_stock || 0);
  const isLowStock = totalStock < 10;
  const isOutOfStock = totalStock === 0;

  return (
    <Card className="w-full max-w-sm mx-auto bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Left Column - Image */}
          <div className="flex-shrink-0">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                  {product.name}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">{product.category}</p>
              </div>
              {/* Status Badge with Low Stock Alert */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isLowStock && (
                  <div className="bg-red-100 border border-red-200 rounded-full p-1">
                    <Package className="h-4 w-4 text-red-600" />
                  </div>
                )}
                <Badge
                  variant={getStatusBadgeVariant(product.status)}
                  className={`text-xs ${getStatusBadgeClass(product.status)}`}
                >
                  {product.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Price */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-700">Price</span>
            <span className="text-xl font-bold text-green-600">₹{product.unit_price}</span>
          </div>
        </div>

        {/* Stock Information */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Stock</span>
            <Badge
              variant={getStockBadgeVariant(totalStock)}
              className="text-sm font-semibold"
            >
              {totalStock}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-md p-2 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Warehouse</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{product.warehouse_stock || 0}</span>
                <Badge variant={getStockBadgeVariant(product.warehouse_stock || 0)} className="text-xs">
                  {(product.warehouse_stock || 0) === 0 ? 'Empty' : (product.warehouse_stock || 0) < 10 ? 'Low' : 'Good'}
                </Badge>
              </div>
            </div>
            <div className="bg-white rounded-md p-2 border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Shelf</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{product.shelf_stock || 0}</span>
                <Badge variant={getStockBadgeVariant(product.shelf_stock || 0)} className="text-xs">
                  {(product.shelf_stock || 0) === 0 ? 'Empty' : (product.shelf_stock || 0) < 10 ? 'Low' : 'Good'}
                </Badge>
              </div>
            </div>
          </div>
        </div>



        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          {onAddToCart && !isOutOfStock && (
            <Button
              onClick={() => onAddToCart(product)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 h-10 text-sm font-medium"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          )}

          <div className="flex gap-3">
            {onEdit && (
              <Button
                onClick={() => onEdit(product)}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white border-0 h-10 text-sm font-medium"
                size="sm"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            )}

            {onRestock && (
              <Button
                onClick={() => onRestock(product)}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white border-0 h-10 text-sm font-medium"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                Restock
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};