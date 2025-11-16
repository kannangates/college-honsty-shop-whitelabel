import React from 'react';
import { useProductContext } from '@/contexts/useProductContext';
import { useCart } from '@/hooks/useCart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { CartSummary } from '@/components/product/CartSummary';
import { WHITELABEL_CONFIG } from '@/config';
import { DataTable } from '@/components/ui/data-table';
import { createProductColumns } from './product-table-columns';
import type { Product } from '@/types/database';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const ProductTable = () => {
  const { products, loading } = useProductContext();
  const { items, updateQuantity, totalPrice, addItem, removeItem, getItemQuantity, checkout } = useCart();
  const productMessages = WHITELABEL_CONFIG.messages.products;

  // Filter active and non-archived products
  const filteredProducts = products.filter(product =>
    product.status === 'active' && !product.is_archived
  );

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  const handleRemoveFromCart = (productId: string) => {
    removeItem(productId);
  };

  const columns = createProductColumns({
    getItemQuantity,
    handleAddToCart,
    handleRemoveFromCart,
  });

  if (loading) return <LoadingSpinner text={productMessages.loading_products || 'Loading products...'} />;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 w-full">
          <Card className="border-0 shadow-lg w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Available Products
              </CardTitle>
            </CardHeader>
            <CardContent className="w-full">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{productMessages.no_products || 'No products available'}</h3>
                  <p className="text-gray-500">{productMessages.check_back || 'Check back later for new products'}</p>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={filteredProducts}
                  searchKey="name"
                  searchPlaceholder="Search products..."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-1">
          <CartSummary
            items={items}
            updateQuantity={updateQuantity}
            totalPrice={totalPrice}
            checkout={checkout}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
