import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from '@/hooks/use-toast';

const MyOrders = () => {
  const { user } = useAuth();
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
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>View your order history</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500">Start shopping now!</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] w-full">
              <div className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <div key={order.id} className="py-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-md font-semibold">Order ID: {order.id}</h4>
                      <Badge variant="secondary">{order.status}</Badge>
                    </div>
                    <p className="text-gray-500">
                      Order Date: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <ul className="mt-2">
                      {order.order_items?.map((item) => (
                        <li key={item.id} className="flex justify-between items-center py-1">
                          <span>{item.products?.name}</span>
                          <span>
                            {item.quantity} x ${item.products?.price} = ${item.quantity * item.products?.price}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-end mt-2">
                      <p className="font-medium">Total: ${order.total_amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyOrders;
