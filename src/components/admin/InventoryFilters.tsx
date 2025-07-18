import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/features/gamification/components/badge';
import { AlertTriangle, Filter } from 'lucide-react';

interface InventoryFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  showLowStock: boolean;
  onLowStockToggle: () => void;
  categories: string[];
  lowStockCount: number;
}

export const InventoryFilters = ({
  selectedCategory,
  onCategoryChange,
  showLowStock,
  onLowStockToggle,
  categories,
  lowStockCount
}: InventoryFiltersProps) => {
  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Category Filter */}
        <div className="w-full lg:w-64">
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Filter by product category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
        {/* Low Stock Alert Toggle */}
          <div 
          className={`cursor-pointer p-3 rounded-lg border transition-colors h-11 flex items-center ${
              showLowStock 
                ? 'bg-red-50 border-red-200 text-red-700' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
            onClick={onLowStockToggle}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Low Stock Alert</span>
              {lowStockCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {lowStockCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};
