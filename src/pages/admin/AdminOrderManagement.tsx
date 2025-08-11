
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import { OrderStats } from '@/components/admin/orders/OrderStats';
import { OrderFilters } from '@/components/admin/orders/OrderFilters';
import { OrdersTable } from '@/components/admin/orders/OrdersTable';

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

const AdminOrderManagement = React.memo(() => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [stats, setStats] = useState({
    todayOrders: 0,
    revenue: 0,
    unpaidRevenue: 0,
    avgOrder: 0
  });
  const { toast } = useToast();
  

  // Memoized fetch functions
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      console.log('📦 Fetching orders with optimized query');
      const { data: allOrders, error: allOrdersError } = await supabase
        .from('orders')
        .select(`
          *,
          users (name, student_id, email),
          order_items (
            *,
            products (*)
          )
        `)
        .order('created_at', { ascending: false });
      if (allOrdersError) throw allOrdersError;
      setOrders(allOrders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchStats = useCallback(async () => {
    try {
      // Calculate stats locally from orders if not provided by backend
      let todayOrders = 0, revenue = 0, unpaidRevenue = 0, avgOrder = 0;
      const today = new Date().toDateString();
      let paidOrders = 0;
      orders.forEach(order => {
        const isToday = new Date(order.created_at).toDateString() === today;
        if (isToday) todayOrders++;
        // Revenue: completed orders
        if (order.payment_status === 'completed') {
          revenue += order.total_amount;
          paidOrders++;
        }
        // Unpaid Revenue: pending, processing, failed
        if (["pending", "processing", "failed"].includes(order.payment_status)) {
          unpaidRevenue += order.total_amount;
        }
      });
      avgOrder = paidOrders > 0 ? Math.round(revenue / paidOrders) : 0;
      setStats({ todayOrders, revenue, unpaidRevenue, avgOrder });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  }, [orders]);

  // Memoized filter function for better performance
  const filterOrders = useCallback(() => {
    let filtered = orders;

    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.users?.name?.toLowerCase().includes(lowercaseSearch) ||
        order.users?.student_id?.toLowerCase().includes(lowercaseSearch) ||
        order.id.toLowerCase().includes(lowercaseSearch) ||
        order.friendly_id?.toLowerCase().includes(lowercaseSearch)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.payment_status === statusFilter);
    }

    if (dateFrom && dateTo) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= dateFrom && orderDate <= dateTo;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, dateFrom, dateTo]);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: string) => {
    try {
      console.log(`🔄 Updating order ${orderId} status to ${newStatus}`);
      
      // Get current order status before updating
      const currentOrder = orders.find(order => order.id === orderId);
      const previousStatus = currentOrder?.payment_status;
      
      await supabase.functions.invoke('order-management', {
        body: { 
          operation: 'update_order',
          id: orderId,
          payment_status: newStatus,
          paid_at: newStatus === 'paid' ? new Date().toISOString() : null
        }
      });


      setOrders(prev => prev.map(order =>
        order.id === orderId 
          ? { ...order, payment_status: newStatus }
          : order
      ));

      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  }, [toast, orders]);

  const clearDateFilter = useCallback(() => {
    setDateFrom(undefined);
    setDateTo(undefined);
  }, []);

  // Effects
  // Fetch orders on mount or refresh
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Calculate stats whenever orders change
  useEffect(() => {
    fetchStats();
  }, [orders, fetchStats]);

  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

  // Memoized components props
  const filterProps = useMemo(() => ({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    onRefresh: fetchOrders,
    onClearDateFilter: clearDateFilter,
    loading
  }), [searchTerm, statusFilter, dateFrom, dateTo, fetchOrders, clearDateFilter, loading]);

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <ShoppingCart className="h-8 w-8" />
          Order Management
        </h1>
        <p className="text-purple-100 text-base ml-14">Track and manage all student orders</p>
      </div>

      <OrderStats stats={stats} />
      
      <OrderFilters {...filterProps} />

      <OrdersTable
        orders={filteredOrders}
        loading={loading}
        onUpdateOrderStatus={updateOrderStatus}
      />
    </div>
  );
});

AdminOrderManagement.displayName = 'AdminOrderManagement';

export default AdminOrderManagement;
