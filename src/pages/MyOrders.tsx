import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/features/gamification/components/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { InvoiceGenerator } from '@/components/invoice/InvoiceGenerator';

interface Order {
  id: string;
  friendly_id?: string;
  created_at: string;
  payment_status: string;
  payment_mode?: string;
  transaction_id?: string;
  paid_at?: string;
  total_amount: number;
  users?: {
    name: string;
    email: string;
  };
  order_items?: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products?: {
      name: string;
      unit_price: number;
    };
  }[];
}

const formatOrderId = (order: Order) =>
  order.friendly_id || `${order.id.substring(0, 8)}...`;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(value);

const MyOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users (name, email),
          order_items (
            *,
            products (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div className="w-full py-12">
        <LoadingSpinner text="Loading your orders..." />
      </div>
    );
  }

  const unpaidOrders = orders.filter(order => order.payment_status === 'unpaid');
  const allOrders = orders;

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8" />
            My Orders
          </h1>
          <p className="text-purple-100">Track your order history and payment status</p>
        </div>
        <Button
          onClick={() => navigate('/add-product')}
          variant="outline"
          className="flex items-center gap-2 rounded-xl border-white/50 text-white hover:border-white transition-all duration-200 backdrop-blur-md bg-white/20 hover:bg-white/30"
        >
          <Package className="h-4 w-4" />
          Add Products
        </Button>
      </div>

      <div className="space-y-6">
        {/* Unpaid Orders Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <ShoppingCart className="h-5 w-5" />
              Pending Payments ({unpaidOrders.length})
            </CardTitle>
            <CardDescription>Orders awaiting payment</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <LoadingSpinner size="sm" text="Loading order details..." className="py-8" />
              </div>
            ) : unpaidOrders.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending payments</h3>
                <p className="text-gray-500">All your orders are paid!</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <ScrollArea className="max-h-[320px] w-full">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {unpaidOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{formatOrderId(order)}</TableCell>
                              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                              <TableCell>
                                <Badge variant="destructive" className="capitalize">{order.payment_status}</Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="destructive"
                                  onClick={() => navigate(`/payment?mode=pay_now&orderId=${order.id}&amount=${order.total_amount}`)}
                                  aria-label="Pay Now"
                                  size="sm"
                                >
                                  Pay Now
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </div>

                <div className="space-y-3 md:hidden">
                  {unpaidOrders.map(order => (
                    <div key={order.id} className="rounded-lg border border-red-100 bg-red-50/50 p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between text-sm font-medium text-gray-900 gap-2">
                        <span className="text-xs uppercase tracking-wide text-red-500">Pending</span>
                        <span className="font-mono">{formatOrderId(order)}</span>
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-gray-700">
                        <p className="flex justify-between">
                          <span>Date:</span>
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </p>
                        <p className="flex justify-between font-semibold">
                          <span>Amount:</span>
                          <span>{formatCurrency(order.total_amount)}</span>
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={() => navigate(`/payment?mode=pay_now&orderId=${order.id}&amount=${order.total_amount}`)}
                        aria-label="Pay Now"
                        className="mt-4 w-full"
                      >
                        Pay Now
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* All Orders Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Package className="h-5 w-5" />
              Order History ({allOrders.length})
            </CardTitle>
            <CardDescription>Complete order history</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-2">Loading...</span>
              </div>
            ) : allOrders.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500">Start shopping now!</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <ScrollArea className="max-h-[320px] w-full">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Invoice</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{formatOrderId(order)}</TableCell>
                              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                              <TableCell>
                                <Badge variant={order.payment_status === 'paid' ? 'default' : 'destructive'} className="capitalize">
                                  {order.payment_status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <InvoiceGenerator 
                                  order={{
                                    ...order,
                                    user: order.users || { name: 'Unknown', email: 'unknown@email.com' }
                                  }} 
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </div>

                <div className="space-y-3 md:hidden">
                  {allOrders.map(order => (
                    <div key={order.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <div>
                          <p className="font-semibold text-gray-900">{formatOrderId(order)}</p>
                          <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={order.payment_status === 'paid' ? 'default' : 'destructive'} className="capitalize">
                          {order.payment_status}
                        </Badge>
                      </div>
                      <div className="mt-3 text-sm text-gray-700">
                        <p className="font-medium">Amount: <span className="font-semibold">{formatCurrency(order.total_amount)}</span></p>
                        {order.transaction_id && (
                          <p className="text-xs text-gray-500 mt-1">Txn ID: {order.transaction_id}</p>
                        )}
                      </div>
                      <div className="mt-4">
                        <InvoiceGenerator 
                          order={{
                            ...order,
                            user: order.users || { name: 'Unknown', email: 'unknown@email.com' }
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyOrders;
