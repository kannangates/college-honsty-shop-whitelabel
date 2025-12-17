import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/features/gamification/components/badge';
import { getPaymentStatusClass } from '@/utils/statusSystem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { InvoiceGenerator } from '@/components/invoice/InvoiceGenerator';
import { OrderCard } from '@/components/orders/OrderCard';
import { ReorderModal } from '@/components/checkout/ReorderModal';
import { RateProductModal } from '@/components/orders/RateProductModal';
import { useReorder } from '@/hooks/useReorder';
import { useRating } from '@/hooks/useRating';

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
    rating?: number;
    review_comment?: string;
    rated_at?: string;
    products?: {
      id: string;
      name: string;
      unit_price: number;
    };
  }[];
}

const formatOrderId = (order: Order) =>
  order.friendly_id || `${order.id.substring(0, 8)}...`;

const buildPaymentUrl = (order: Order) => {
  const friendlyOrderId = order.friendly_id || order.id;
  const encodedOrderId = encodeURIComponent(friendlyOrderId);
  return `/payment?mode=pay_now&orderId=${encodedOrderId}`;
};

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
  const {
    isReorderModalOpen,
    selectedOrderItems,
    selectedOrderNumber,
    initiateReorder,
    closeReorderModal
  } = useReorder();

  const {
    isRatingModalOpen,
    selectedOrderItems: selectedRatingItems,
    selectedOrderNumber: selectedRatingOrderNumber,
    initiateRating,
    closeRatingModal,
  } = useRating();

  const fetchOrders = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping order fetch');
      setLoading(false);
      return;
    }

    console.log('Fetching orders for user:', user.id);
    console.log('User object:', user);
    setLoading(true);
    try {
      // First, let's check if the user exists in the users table
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('id', user.id)
        .single();

      console.log('User profile check:', { userProfile, userError });

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users (name, email),
          order_items (
            *,
            rating,
            review_comment,
            rated_at,
            products (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Orders query result:', { data, error, userIdUsed: user.id });
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      console.log('Setting orders:', data?.length || 0, 'orders found');
      setOrders((data || []) as unknown as Order[]);

      // If no orders found, let's check if there are any orders in the database at all
      if (!data || data.length === 0) {
        console.log('No orders found for user. This could mean:');
        console.log('1. User has no orders');
        console.log('2. RLS policy is blocking access');
        console.log('3. User ID mismatch');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      toast({
        title: 'Error',
        description: `Failed to load orders: ${error.message || 'Unknown error'}`,
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
      {/* Debug Info - Remove this after fixing */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Debug Info:</strong>
          <br />User ID: {user?.id || 'Not logged in'}
          <br />User Email: {user?.email || 'N/A'}
          <br />Orders Count: {orders.length}
          <br />Loading: {loading ? 'Yes' : 'No'}
        </div>
      )}

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
                                <Badge className={`capitalize ${getPaymentStatusClass(order.payment_status)}`}>{order.payment_status}</Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="destructive"
                                  onClick={() => navigate(buildPaymentUrl(order))}
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

                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {unpaidOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onPayNow={() => navigate(buildPaymentUrl(order))}
                      showRating={false}
                    />
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
                                <Badge className={`capitalize ${getPaymentStatusClass(order.payment_status)}`}>
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

                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {allOrders.map(order => (
                    <div key={order.id} className="relative">
                      <OrderCard
                        order={order}
                        onPayNow={order.payment_status === 'unpaid' ? () => navigate(buildPaymentUrl(order)) : undefined}
                        onReorder={() => initiateReorder(order)}
                        onRateProduct={() => initiateRating(order)}
                        onDownloadInvoice={() => {
                          // Trigger invoice download
                          const invoiceButton = document.querySelector(`[data-order-id="${order.id}"] button`);
                          if (invoiceButton) {
                            (invoiceButton as HTMLButtonElement).click();
                          }
                        }}
                        showRating={order.payment_status === 'paid'}
                      />
                      {/* Hidden invoice generator for download functionality */}
                      <div className="hidden" data-order-id={order.id}>
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

      {/* Reorder Modal */}
      <ReorderModal
        isOpen={isReorderModalOpen}
        onClose={closeReorderModal}
        orderItems={selectedOrderItems}
        orderNumber={selectedOrderNumber}
      />

      {/* Rate Product Modal */}
      <RateProductModal
        isOpen={isRatingModalOpen}
        onClose={closeRatingModal}
        orderItems={selectedRatingItems}
        orderNumber={selectedRatingOrderNumber}
        onRatingSubmitted={fetchOrders}
      />
    </div>
  );
};

export default MyOrders;
