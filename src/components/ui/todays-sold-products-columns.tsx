"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from '@/features/gamification/components/badge';

interface Product {
  product_name: string;
  total_quantity: number;
  paid_quantity: number;
  unpaid_quantity: number;
  paid_amount: number;
  unpaid_amount: number;
}

export const todaysSoldProductsColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "product_name",
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
    cell: ({ row }) => <div className="font-medium">{row.getValue("product_name")}</div>,
  },
  {
    accessorKey: "total_quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Qty
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-center">
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {row.getValue("total_quantity")}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "paid_quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Paid Qty
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-center">
        <span className="text-green-600 font-medium">{row.getValue("paid_quantity")}</span>
      </div>
    ),
  },
  {
    accessorKey: "unpaid_quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Unpaid Qty
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-center">
        <span className="text-red-600 font-medium">{row.getValue("unpaid_quantity")}</span>
      </div>
    ),
  },
  {
    accessorKey: "paid_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Paid Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("paid_amount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)
      return (
        <div className="text-right">
          <div className="flex items-center justify-end gap-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-green-600 font-medium">{formatted}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "unpaid_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Unpaid Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("unpaid_amount"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)
      return (
        <div className="text-right">
          <div className="flex items-center justify-end gap-1">
            <DollarSign className="h-4 w-4 text-red-600" />
            <span className="text-red-600 font-medium">{formatted}</span>
          </div>
        </div>
      )
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const product = row.original
      const paidPercentage = (product.paid_quantity / product.total_quantity) * 100
      
      let statusBadge
      if (paidPercentage === 100) {
        statusBadge = <Badge className="bg-green-100 text-green-800">All Paid</Badge>
      } else if (paidPercentage === 0) {
        statusBadge = <Badge className="bg-red-100 text-red-800">Unpaid</Badge>
      } else {
        statusBadge = <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
      }
      
      return <div className="text-center">{statusBadge}</div>
    },
  },
] 