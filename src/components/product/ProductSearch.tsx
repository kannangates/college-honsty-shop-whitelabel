import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProductSearchProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
}

export const ProductSearch = ({
  searchTerm,
  onSearchChange
}: ProductSearchProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="w-full lg:w-80">
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
      </div>
    </div>
  );
};
