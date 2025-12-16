import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/features/gamification/components/badge';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, Minus, Plus } from 'lucide-react';
import { getStockBadgeClass } from '@/utils/statusSystem';
import type { Product } from '@/types/database';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onAddToCart,
  onRemoveFromCart
}) => {
  const shelfStock = product.shelf_stock || 0;
  const isOutOfStock = shelfStock <= 0;
  const isLowStock = shelfStock > 0 && shelfStock <= 10;
  const total = quantity * product.unit_price;

  return (
    <Card className="w-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 border-0">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Product Image */}
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

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                  {product.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {product.category || 'Uncategorized'}
                  </span>
                  {isLowStock && (
                    <div className="bg-yellow-100 border border-yellow-200 rounded-full p-1">
                      <Package className="h-3 w-3 text-yellow-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Price and Stock Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            {/* Unit Price */}
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-600">Unit Price</span>
              <span className="text-lg font-bold text-green-600">₹{product.unit_price.toLocaleString()}</span>
            </div>

            {/* Available Stock */}
            <div className="flex flex-col items-end">
              <span className="text-xs font-medium text-gray-600">Available Stock</span>
              <Badge
                variant="outline"
                className={`text-sm font-semibold ${getStockBadgeClass(shelfStock)} mt-1`}
              >
                {shelfStock}
              </Badge>
            </div>
          </div>
          {isOutOfStock && (
            <div className="text-xs text-red-600 font-medium mt-2">
              Out of Stock
            </div>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between gap-2">
            {/* Quantity Label and Controls */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm font-medium text-blue-700 flex-shrink-0">Qty:</span>
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => onRemoveFromCart(product.id)}
                  disabled={quantity === 0}
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 rounded-full border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>

                <div className="bg-white border border-gray-200 rounded px-2 py-1 min-w-[40px] text-center">
                  <span className="text-sm font-bold text-gray-900">{quantity}</span>
                </div>

                <Button
                  onClick={() => onAddToCart(product)}
                  disabled={isOutOfStock || quantity >= shelfStock}
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 rounded-full border border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Total Price */}
            <div className="flex flex-col items-end flex-shrink-0">
              <span className="text-xs font-medium text-blue-600">Total</span>
              <span className="text-base font-bold text-blue-600">₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Add to Cart Button */}
        {!isOutOfStock && (
          <Button
            onClick={() => onAddToCart(product)}
            disabled={quantity >= shelfStock}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 h-12 text-sm font-medium"
          >
            <ShoppingCart className="h-4 w-4" />
            {quantity > 0 ? 'Add More' : 'Add to Cart'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};