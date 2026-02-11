import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/features/gamification/components/badge';
import { AlertTriangle, Search } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '@/constants/productCategories';

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  stockFilter: string;
  onStockFilterChange: (filter: string) => void;
  outOfStockCount: number;
  lowStockCount: number;
}

export const ProductFilters = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  stockFilter,
  onStockFilterChange,
  outOfStockCount,
  lowStockCount
}: ProductFiltersProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
        {/* Search Input */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex-1 min-w-[200px]">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PRODUCT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="flex-1 min-w-[180px]">
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stock Filter */}
        <div className="flex-1 min-w-[200px]">
          <Select value={stockFilter} onValueChange={onStockFilterChange}>
            <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
              <SelectValue placeholder="Stock Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Low Stock
                  {lowStockCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {lowStockCount}
                    </Badge>
                  )}
                </div>
              </SelectItem>
              <SelectItem value="out-of-stock">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Out of Stock
                  {outOfStockCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {outOfStockCount}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};