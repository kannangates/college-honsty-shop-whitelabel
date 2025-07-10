
import React from 'react';
import { Package } from 'lucide-react';
import ProductTable from '@/components/product/ProductTable';

const AddProduct = () => {
  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Package className="h-8 w-8" />
          Add Products to Cart
        </h1>
        <p className="text-purple-100">Select products and add them to your cart</p>
      </div>

      {/* Render full product table and cart summary from the component */}
      <ProductTable />
    </div>
  );
};

export default AddProduct;
