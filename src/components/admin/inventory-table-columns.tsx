"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit, Package2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string;
  name: string;
  unit_price: number;
  opening_stock: number;
  status: string;
  created_at: string;
}

interface InventoryTableColumnsProps {
  onEdit: (product: Product) => void;
  onRestock: (product: Product) => void;
}

export const createInventoryColumns = ({
  onEdit,
  onRestock,
}: InventoryTableColumnsProps): ColumnDef<Product>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const product = row.original
      const stockStatus = getStockStatus(product.opening_stock)
      
      return (
        <div className="flex items-center gap-2">
          {stockStatus.icon}
          <span className="truncate max-w-[200px] font-medium">{product.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "unit_price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
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
    accessorKey: "opening_stock",
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
      const stock = row.getValue("opening_stock") as number
      const stockStatus = getStockStatus(stock)
      
      return (
        <span className={`font-medium ${stockStatus.color}`}>
          {stock} units
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return getStatusBadge(status)
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"))
      return <div className="text-gray-600">{date.toLocaleDateString()}</div>
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const product = row.original
      
      return (
        <div className="flex items-center gap-2 justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(product)}
            className="h-8 px-2"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            onClick={() => onRestock(product)}
            className="h-8 px-2 bg-gradient-to-r from-[#202072] to-[#e66166] text-white hover:opacity-90"
          >
            <Package2 className="h-3 w-3 mr-1" />
            Restock
          </Button>
        </div>
      )
    },
  },
]

// Helper functions
const getStatusBadge = (status: string) => {
  return status === 'true' ? (
    <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
  ) : (
    <Badge variant="secondary" className="bg-red-100 text-red-800">Inactive</Badge>
  );
};

const getStockStatus = (stock: number) => {
  if (stock === 0) {
    return { icon: <AlertTriangle className="h-4 w-4 text-red-500" />, color: 'text-red-600' };
  } else if (stock <= 10) {
    return { icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />, color: 'text-yellow-600' };
  }
  return { icon: <Package2 className="h-4 w-4 text-green-500" />, color: 'text-green-600' };
}; 