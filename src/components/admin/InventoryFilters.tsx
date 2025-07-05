import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
    <Card className="border-0 shadow-lg mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Inventory Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
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
          
          <div 
            className={`cursor-pointer p-2 rounded-lg border transition-colors ${
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
      </CardContent>
    </Card>
  );
};
