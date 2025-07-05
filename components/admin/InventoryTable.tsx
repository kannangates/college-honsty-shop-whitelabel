import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { createInventoryColumns } from './inventory-table-columns';

interface Product {
  id: string;
  name: string;
  unit_price: number;
  opening_stock: number;
  status: string;
  created_at: string;
}

interface InventoryTableProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onRestock: (product: Product) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  loading,
  onEdit,
  onRestock
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading products...</span>
      </div>
    );
  }

  const columns = createInventoryColumns({
    onEdit,
    onRestock,
  });

  return (
    <div className="rounded-lg border shadow-sm bg-white">
      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Search products..."
      />
    </div>
  );
};
