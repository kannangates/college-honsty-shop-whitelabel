import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Eye } from 'lucide-react';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  payment_status: string;
  payment_mode: string;
  users: {
    student_id: string;
    name: string;
  };
  order_items: Array<{
    quantity: number;
    unit_price: number;
    products: { name: string };
  }>;
}

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
}

export const OrdersTable = ({ orders, loading, onUpdateOrderStatus }: OrdersTableProps) => {
  const [statusPopoverOpen, setStatusPopoverOpen] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'unpaid': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-800">Orders ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.users?.name}</p>
                      <p className="text-sm text-gray-500">{order.users?.student_id}</p>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {order.order_items?.slice(0, 2).map((item, index) => (
                        <p key={index} className="text-sm">
                          {item.products?.name} (×{item.quantity})
                        </p>
                      ))}
                      {order.order_items?.length > 2 && (
                        <p className="text-xs text-gray-500">+{order.order_items.length - 2} more</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">₹{order.total_amount}</TableCell>
                  <TableCell>{order.payment_mode || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.payment_status)}>
                      {order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Order Details</DialogTitle>
                          <DialogDescription>Order ID: {order.id}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Customer</Label>
                            <p>{order.users?.name} ({order.users?.student_id})</p>
                          </div>
                          <div>
                            <Label>Items</Label>
                            <div className="space-y-1">
                              {order.order_items?.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                  <span>{item.products?.name} (×{item.quantity})</span>
                                  <span>₹{(item.unit_price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label>Update Status</Label>
                            <Popover open={statusPopoverOpen === order.id} onOpenChange={(open) => setStatusPopoverOpen(open ? order.id : null)}>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className={cn(
                                    "w-full h-10 border border-input bg-background rounded-md px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                    !order.payment_status && "text-muted-foreground"
                                  )}
                                >
                                  {order.payment_status || "Select status"}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                <Command>
                                  <CommandInput placeholder="Search status..." />
                                  <CommandList>
                                    <CommandEmpty>No status found.</CommandEmpty>
                                    {['unpaid', 'paid', 'cancelled'].map((status) => (
                                      <CommandItem
                                        key={status}
                                        value={status}
                                        onSelect={() => {
                                          onUpdateOrderStatus(order.id, status);
                                          setStatusPopoverOpen(null);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            order.payment_status === status ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                      </CommandItem>
                                    ))}
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
