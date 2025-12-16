import React from 'react';
import { StockOperationCard } from './StockOperationCard';

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category: string;
  shelf_stock: number;
  warehouse_stock: number;
  created_at?: string;
  created_by?: string;
  image_url?: string;
  is_archived?: boolean;
  opening_stock?: number;
  status?: string;
  unit_price?: number;
  updated_by?: string;
  updated_at?: string;
  [key: string]: string | number | boolean | undefined;
}

interface StockOperationRow {
  id?: string;
  product_id: string;
  opening_stock: number;
  additional_stock: number;
  actual_closing_stock: number;
  estimated_closing_stock: number;
  stolen_stock: number;
  wastage_stock: number;
  warehouse_stock: number;
  sales: number;
  order_count: number;
  created_at: string;
  updated_at?: string | null;
}

interface StockOperation extends StockOperationRow {
  product: Product;
}

interface StockOperationCardGridProps {
  operations: StockOperation[];
  onOperationChange: (operationId: string | undefined, productId: string, field: keyof StockOperation, value: number) => void;
  loading?: boolean;
}

export const StockOperationCardGrid: React.FC<StockOperationCardGridProps> = ({
  operations,
  onOperationChange,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-200 animate-pulse rounded-lg h-64 w-full"
          />
        ))}
      </div>
    );
  }

  if (operations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No stock operations found</h3>
        <p className="text-gray-500 text-center max-w-sm">
          No stock operations match your current filters. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-3">
      {operations.map((operation, index) => (
        <StockOperationCard
          key={operation.id || `temp-${operation.product_id}-${index}`}
          operation={operation}
          onOperationChange={onOperationChange}
        />
      ))}
    </div>
  );
};