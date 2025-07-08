
import React from 'react';
import { useProductContext, Product } from '@/contexts/ProductContext';
import { useCart } from '@/hooks/useCart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { CartSummary } from '@/components/product/CartSummary';
import { getCurrentMessages } from '@/config';
import { DataTable } from '@/components/ui/data-table';
import { createProductColumns } from './product-table-columns';

const ProductTable = () => {
  const { products, loading } = useProductContext();
  const { items, updateQuantity, totalPrice, addItem, removeItem, getItemQuantity, checkout } = useCart();
  const messages = getCurrentMessages();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">{messages.loading?.loading_products || 'Loading products...'}</span>
      </div>
    );
  }

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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{messages.products?.no_products || 'No products available'}</h3>
                  <p className="text-gray-500">{messages.products?.check_back || 'Check back later for new products'}</p>
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
