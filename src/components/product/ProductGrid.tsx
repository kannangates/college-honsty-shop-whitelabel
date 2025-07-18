
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/features/gamification/components/badge';
import { Button } from '@/components/ui/button';
import { Package, Plus, RefreshCw } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  unit_price: number;
  shelf_stock: number;
  warehouse_stock: number;
  status: string;
  created_at: string;
}

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  searchTerm: string;
  addToCart: (product: Product) => void;
}

export const ProductGrid = ({ products, loading, searchTerm, addToCart }: ProductGridProps) => {
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (product: Product) => {
    const stock = product.shelf_stock || 0;
    if (stock === 0) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (stock <= 10) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-green-100 text-green-800 border-green-200';
  };

  if (loading) {
    return (
      <div className="col-span-full text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading products...</p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="col-span-full text-center py-8">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">
          {searchTerm ? 'Try adjusting your search criteria' : 'No products available at the moment'}
        </p>
      </div>
    );
  }

  return (
    <>
      {filteredProducts.map((product) => (
        <Card key={product.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-r from-[#202072] to-[#e66166] rounded-full flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <Badge className={getStatusColor(product)}>
                {product.shelf_stock === 0 ? 'Out of Stock' : 
                 product.shelf_stock <= 10 ? 'Low Stock' : 'In Stock'}
              </Badge>
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">{product.name}</CardTitle>
              <CardDescription className="text-sm">
                Product ID: {product.id.slice(0, 8)}...
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium text-gray-900">₹{product.unit_price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Stock:</span>
                <span className={`font-medium ${
                  product.shelf_stock <= 10 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {product.shelf_stock} units
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                onClick={() => addToCart(product)}
                disabled={product.shelf_stock === 0}
                className="w-full bg-gradient-to-r from-[#202072] to-[#e66166] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};
