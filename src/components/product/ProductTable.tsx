import { useState, useMemo, useEffect } from 'react';
import { useProductContext } from '@/contexts/useProductContext';
import { useCart } from '@/hooks/useCart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Grid, List } from 'lucide-react';
import { CartSummary } from '@/components/product/CartSummary';
import { ProductFilters } from '@/components/product/ProductFilters';
import { ProductCardGrid } from '@/components/product/ProductCardGrid';
import { WHITELABEL_CONFIG } from '@/config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Product } from '@/types/database';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useResponsiveView } from '@/hooks/useResponsiveView';

const ProductTable = () => {
  const { products, loading } = useProductContext();
  const { items, updateQuantity, totalPrice, addItem, removeItem, getItemQuantity, checkout } = useCart();
  const productMessages = WHITELABEL_CONFIG.messages.products;
  const isMobile = useResponsiveView();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [stockFilter, setStockFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // Auto-switch to cards view on mobile
  useEffect(() => {
    if (isMobile && viewMode === 'table') {
      setViewMode('cards');
    }
  }, [isMobile, viewMode]);

  // Filter and process products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => !product.is_archived);

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(product => product.status === selectedStatus);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply stock filter
    if (stockFilter === 'in-stock') {
      filtered = filtered.filter(product => (product.shelf_stock || 0) > 0);
    } else if (stockFilter === 'low-stock') {
      filtered = filtered.filter(product => {
        const stock = product.shelf_stock || 0;
        return stock > 0 && stock <= 10;
      });
    } else if (stockFilter === 'out-of-stock') {
      filtered = filtered.filter(product => (product.shelf_stock || 0) === 0);
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, selectedStatus, stockFilter]);

  // Calculate stock counts for filter badges
  const stockCounts = useMemo(() => {
    const activeProducts = products.filter(product =>
      product.status === 'active' && !product.is_archived
    );

    const outOfStock = activeProducts.filter(product => (product.shelf_stock || 0) === 0).length;
    const lowStock = activeProducts.filter(product => {
      const stock = product.shelf_stock || 0;
      return stock > 0 && stock <= 10;
    }).length;

    return { outOfStock, lowStock };
  }, [products]);

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  const handleRemoveFromCart = (productId: string) => {
    removeItem(productId);
  };

  // Removed unused columns variable

  if (loading) return <LoadingSpinner text={productMessages.loading_products || 'Loading products...'} />;

  return (
    <div className="w-full space-y-6">
      {/* Filters Section */}
      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        stockFilter={stockFilter}
        onStockFilterChange={setStockFilter}
        outOfStockCount={stockCounts.outOfStock}
        lowStockCount={stockCounts.lowStock}
      />

      {/* Main Content */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 xl:w-2/3">
          <Card className="border-0 shadow-lg w-full h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Available Products ({filteredProducts.length})
                </CardTitle>
                {/* View Mode Toggle - Hidden on mobile */}
                <div className="hidden sm:flex items-center border rounded-lg p-1">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="flex items-center gap-1"
                  >
                    <List className="h-4 w-4" />
                    Table
                  </Button>
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="flex items-center gap-1"
                  >
                    <Grid className="h-4 w-4" />
                    Cards
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className={viewMode === 'cards' ? 'p-0' : 'w-full'}>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || selectedCategory !== 'all' || stockFilter !== 'all'
                      ? 'No products match your filters'
                      : (productMessages.no_products || 'No products available')
                    }
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || selectedCategory !== 'all' || stockFilter !== 'all'
                      ? 'Try adjusting your search criteria or filters'
                      : (productMessages.check_back || 'Check back later for new products')
                    }
                  </p>
                </div>
              ) : viewMode === 'cards' ? (
                <ProductCardGrid
                  products={filteredProducts}
                  getItemQuantity={getItemQuantity}
                  onAddToCart={handleAddToCart}
                  onRemoveFromCart={handleRemoveFromCart}
                  loading={loading}
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-left">Product Name</TableHead>
                        <TableHead className="text-left">Category</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => {
                        const quantity = getItemQuantity(product.id);
                        const shelfStock = product.shelf_stock || 0;
                        const isOutOfStock = shelfStock <= 0;
                        const total = quantity * product.unit_price;

                        return (
                          <TableRow key={product.id}>
                            <TableCell className="text-left">
                              <div className="flex flex-col">
                                <span className="font-medium">{product.name}</span>
                                {isOutOfStock && (
                                  <span className="text-xs text-red-600 font-medium mt-1">
                                    {productMessages.out_of_stock || 'Out of Stock'}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-left">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {product.category || 'Uncategorized'}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">
                              ₹{product.unit_price.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-start">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${shelfStock > 10
                                  ? 'bg-green-100 text-green-800'
                                  : shelfStock > 0
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                  }`}>
                                  {shelfStock}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleRemoveFromCart(product.id)}
                                  disabled={quantity === 0}
                                  className="h-8 w-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <span className="text-lg">−</span>
                                </button>
                                <span className="w-8 text-center font-medium">{quantity}</span>
                                <button
                                  onClick={() => handleAddToCart(product)}
                                  disabled={isOutOfStock || quantity >= shelfStock}
                                  className="h-8 w-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <span className="text-lg">+</span>
                                </button>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              ₹{total.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="xl:w-1/3 xl:self-start">
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
