import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/features/gamification/components/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Eye, Download, Pencil } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty, CommandGroup } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { useDataExport } from '@/hooks/useDataExport';

interface Order {
  id: string;
  friendly_id?: string;
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
  onUpdateOrderStatus: (orderId: string, status: string) => Promise<void>;
}

export const OrdersTable = ({ orders, loading, onUpdateOrderStatus }: OrdersTableProps) => {
  const [statusPopoverOpen, setStatusPopoverOpen] = useState<string | null>(null);
  const [cancellingOrders, setCancellingOrders] = useState<Set<string>>(new Set());
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ orderId: string; action: 'cancel' | 'unmark' } | null>(null);
  const { exportData, isExporting } = useDataExport();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'unpaid': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleActionConfirm = async () => {
    if (!pendingAction) return;

    setCancellingOrders(prev => new Set(prev).add(pendingAction.orderId));
    try {
      const status = pendingAction.action === 'cancel' ? 'cancelled' : 'unpaid';
      await onUpdateOrderStatus(pendingAction.orderId, status);
    } finally {
      setCancellingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(pendingAction.orderId);
        return newSet;
      });
      setConfirmDialogOpen(false);
      setPendingAction(null);
    }
  };

  const openCancelDialog = (orderId: string) => {
    setPendingAction({ orderId, action: 'cancel' });
    setConfirmDialogOpen(true);
  };

  const openUnmarkDialog = (orderId: string) => {
    setPendingAction({ orderId, action: 'unmark' });
    setConfirmDialogOpen(true);
  };

  const handleExport = () => {
    const exportHeaders = [
      'Order ID', 'Student Name', 'Student ID', 'Date', 'Amount', 'Payment Mode', 'Status', 'Items'
    ];

    const exportRows = orders.map(order => [
      order.friendly_id || order.id,
      order.users?.name || 'N/A',
      order.users?.student_id || 'N/A',
      new Date(order.created_at).toLocaleDateString(),
      order.total_amount,
      order.payment_mode || 'N/A',
      order.payment_status,
      order.order_items?.map(item => `${item.products?.name} (×${item.quantity})`).join(', ') || 'N/A'
    ]);

    exportData({
      headers: exportHeaders,
      data: exportRows,
      filename: `orders-${new Date().toISOString().split('T')[0]}`
    }, 'csv');
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-gray-800">Orders ({orders.length})</CardTitle>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || orders.length === 0}
            className="text-sm"
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
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
                  <LoadingSpinner size="md" text="Loading orders..." />
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
                  <TableCell className="font-medium">
                    {order.friendly_id || `${order.id.slice(0, 8)}...`}
                  </TableCell>
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
                    <Popover
                      open={statusPopoverOpen === order.id}
                      onOpenChange={(open) => setStatusPopoverOpen(open ? order.id : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-24 justify-between",
                            getStatusColor(order.payment_status)
                          )}
                        >
                          {order.payment_status}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-0" align="start">
                        <Command>
                          <CommandList>
                            <CommandEmpty>No status found.</CommandEmpty>
                            <CommandGroup>
                              {['paid', 'unpaid', 'cancelled'].map((status) => (
                                <CommandItem
                                  key={status}
                                  value={status}
                                  onSelect={async () => {
                                    await onUpdateOrderStatus(order.id, status);
                                    setStatusPopoverOpen(null);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      order.payment_status === status ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {status}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell>
                    {order.payment_status !== 'cancelled' ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={cancellingOrders.has(order.id)}
                        onClick={() => openCancelDialog(order.id)}
                        aria-label="Cancel Order"
                      >
                        {cancellingOrders.has(order.id) ? 'Cancelling...' : 'Cancel'}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={cancellingOrders.has(order.id)}
                        onClick={() => openUnmarkDialog(order.id)}
                        aria-label="Unmark Cancelled"
                      >
                        {cancellingOrders.has(order.id) ? 'Processing...' : 'Unmark Cancelled'}
                      </Button>
                    )}
                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title={pendingAction?.action === 'cancel' ? 'Cancel Order' : 'Unmark Cancelled'}
        description={
          pendingAction?.action === 'cancel'
            ? `Are you sure you want to cancel order ${orders.find(o => o.id === pendingAction?.orderId)?.friendly_id || pendingAction?.orderId?.slice(0, 8)}? This action cannot be undone.`
            : `Are you sure you want to unmark order ${orders.find(o => o.id === pendingAction?.orderId)?.friendly_id || pendingAction?.orderId?.slice(0, 8)} as cancelled?`
        }
        onConfirm={handleActionConfirm}
        destructive={pendingAction?.action === 'cancel'}
      />
    </Card>
  );
};
