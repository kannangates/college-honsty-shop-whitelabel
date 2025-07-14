
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Plus, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Product } from "@/contexts/ProductContext"
import { WHITELABEL_CONFIG } from '@/config';

interface ProductTableColumnsProps {
  getItemQuantity: (productId: string) => number
  handleAddToCart: (product: Product) => void
  handleRemoveFromCart: (productId: string) => void
}

export const createProductColumns = ({
  getItemQuantity,
  handleAddToCart,
  handleRemoveFromCart,
}: ProductTableColumnsProps): ColumnDef<Product>[] => {
  const productMessages = WHITELABEL_CONFIG.messages.products;
  
  return [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Product Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const product = row.original
        const isOutOfStock = product.shelf_stock <= 0
        
        return (
          <div className="flex flex-col">
            <span className="font-medium">{product.name}</span>
            {isOutOfStock && (
              <Badge variant="destructive" className="w-fit mt-1">
                {productMessages.out_of_stock || 'Out of Stock'}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("category") || 'Uncategorized'}</Badge>
      ),
    },
    {
      accessorKey: "unit_price",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Unit Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("unit_price"))
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(amount)
        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "shelf_stock",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Stock
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const stock = row.getValue("shelf_stock") as number
        return (
          <Badge variant={stock > 10 ? "default" : "secondary"}>
            {stock}
          </Badge>
        )
      },
    },
    {
      id: "quantity",
      header: "Quantity",
      cell: ({ row }) => {
        const product = row.original
        const quantity = getItemQuantity(product.id)
        const isOutOfStock = product.shelf_stock <= 0
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRemoveFromCart(product.id)}
              disabled={quantity === 0}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddToCart(product)}
              disabled={isOutOfStock || quantity >= product.shelf_stock}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => {
        const product = row.original
        const quantity = getItemQuantity(product.id)
        const total = quantity * product.unit_price
        
        const formatted = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
        }).format(total)
        
        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original
        const isOutOfStock = product.shelf_stock <= 0
        
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddToCart(product)}
            disabled={isOutOfStock}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            {productMessages.add_to_cart || 'Add to Cart'}
          </Button>
        )
      },
    },
  ];
};
