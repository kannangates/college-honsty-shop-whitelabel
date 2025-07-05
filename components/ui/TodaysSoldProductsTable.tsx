import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingBag } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { todaysSoldProductsColumns } from './todays-sold-products-columns';

interface Product {
  product_name: string;
  total_quantity: number;
  paid_quantity: number;
  unpaid_quantity: number;
  paid_amount: number;
  unpaid_amount: number;
}

interface TodaysSoldProductsTableProps {
  products: Product[];
}

const TodaysSoldProductsTable: React.FC<TodaysSoldProductsTableProps> = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            📦 Today's Sold Products
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No products sold today</p>
            <p className="text-sm">Check back later for sales data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          📦 Today's Sold Products
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <DataTable
          columns={todaysSoldProductsColumns}
          data={products}
          searchKey="product_name"
          searchPlaceholder="Search products..."
        />
      </CardContent>
    </Card>
  );
};

export default TodaysSoldProductsTable;
