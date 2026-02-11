import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, CreditCard, Search, RefreshCw, Plus } from 'lucide-react';
import { TransactionTable } from '@/components/admin/TransactionTable';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { PaymentRecordModal } from '@/components/admin/PaymentRecordModal';
import { PaymentStatusModal } from '@/components/admin/PaymentStatusModal';
import { TransactionCard } from '@/components/admin/TransactionCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const AdminPaymentReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [isPaymentRecordOpen, setIsPaymentRecordOpen] = useState(false);
  const [isPaymentStatusOpen, setIsPaymentStatusOpen] = useState(false);

  interface PaymentRecord {
    id: string;
    studentId: string;
    studentName: string;
    amount: number;
    date: string;
    method: string;
    status: 'Paid' | 'Unpaid' | 'Cancelled';
    transactionId?: string;
    orderId?: string;
    items?: string[];
    createdAt?: string;
  }

  interface EditingPayment {
    id: string;
    orderId: string;
    transactionId: string;
    paymentMethod: string;
    paidAt: string;
  }

  interface EditingPaymentStatus {
    id: string;
    orderId: string;
    studentName: string;
    studentId: string;
    amount: number;
    currentStatus: string;
    transactionId?: string;
    paymentMethod?: string;
    paidAt?: string;
  }

  interface OrderData {
    id: string;
    friendly_id?: string;
    total_amount?: number;
    paid_at?: string;
    created_at?: string;
    payment_mode?: string;
    transaction_id?: string;
    payment_status?: string;
    users?: {
      name?: string;
      student_id?: string;
      email?: string;
    };
  }

  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState<EditingPayment | null>(null);
  const [editingPaymentStatus, setEditingPaymentStatus] = useState<EditingPaymentStatus | null>(null);
  const { toast } = useToast();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      console.log('💳 Fetching payment records');
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          friendly_id,
          total_amount,
          paid_at,
          created_at,
          payment_mode,
          transaction_id,
          payment_status,
          users (name, student_id, email)
        `)
        .order('created_at', { ascending: false });

      console.log('💳 Payment records query result:', { data, error });
      if (error) {
        console.error('💳 Supabase error:', error);
        throw error;
      }

      if (!data || !Array.isArray(data)) {
        console.warn('⚠️ No data returned from payment records query');
        setPaymentRecords([]);
        return;
      }

      const formattedData = data.map((order: OrderData) => {
        const getStatusLabel = (status: string) => {
          switch (status) {
            case 'paid': return 'Paid';
            case 'unpaid': return 'Unpaid';
            case 'pending': return 'Pending';
            case 'refunded': return 'Refunded';
            case 'cancelled': return 'Cancelled';
            case 'failed': return 'Unpaid'; // Map failed to unpaid for simplicity
            default: return 'Unpaid'; // Default to unpaid
          }
        };

        try {
          return {
            id: order.id || '',
            studentId: order.users?.student_id || 'Unknown',
            studentName: order.users?.name || 'Unknown',
            amount: order.total_amount || 0,
            date: order.paid_at ? format(new Date(order.paid_at), 'yyyy-MM-dd') : format(new Date(order.created_at || new Date()), 'yyyy-MM-dd'),
            method: order.payment_mode || 'N/A',
            status: getStatusLabel(order.payment_status || 'unpaid') as PaymentRecord['status'],
            transactionId: order.transaction_id || 'N/A',
            orderId: order.friendly_id || order.id?.slice(0, 8) || 'N/A',
            createdAt: order.created_at
          };
        } catch (mapError) {
          console.error('Error mapping order:', mapError, order);
          return null;
        }
      }).filter((record: PaymentRecord | null): record is PaymentRecord => record !== null);

      setPaymentRecords(formattedData);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment records',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Real-time subscription for payment updates
  useEffect(() => {
    console.log('🔄 Setting up real-time subscription for payments');

    const paymentsSubscription = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('💳 Real-time payment change:', payload);
          // Refetch payments when any order change occurs
          fetchPayments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          console.log('👤 Real-time user change:', payload);
          // Refetch payments when user info changes
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up payments subscription');
      supabase.removeChannel(paymentsSubscription);
    };
  }, [fetchPayments]);

  const handleEditPaymentStatus = (payment: PaymentRecord) => {
    setEditingPaymentStatus({
      id: payment.id,
      orderId: payment.id,
      studentName: payment.studentName,
      studentId: payment.studentId,
      amount: payment.amount,
      currentStatus: payment.status.toLowerCase(),
      transactionId: payment.transactionId !== 'N/A' ? payment.transactionId : '',
      paymentMethod: payment.method !== 'N/A' ? payment.method : '',
      paidAt: payment.date
    });
    setIsPaymentStatusOpen(true);
  };

  const handleDeletePayment = async (orderId: string) => {
    if (!confirm('Are you sure you want to mark this order as unpaid? This will remove the payment record.')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'unpaid',
          transaction_id: null,
          paid_at: null
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Order marked as unpaid successfully'
      });

      fetchPayments();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive'
      });
    }
  };

  // Removed static records - using only real data from Supabase

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All' },
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'pending', label: 'Pending' },
    { value: 'refunded', label: 'Refunded' }
  ], []);

  const filteredRecords = useMemo(() => {
    // Only use real payment records from Supabase
    return paymentRecords.filter(record => {
      const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || record.status.toLowerCase() === statusFilter;
      const recordDate = new Date(record.date);
      const matchesDate = (!dateRange.from && !dateRange.to) ||
        (dateRange.from && dateRange.to && recordDate >= dateRange.from && recordDate <= dateRange.to) ||
        (dateRange.from && !dateRange.to && recordDate >= dateRange.from) ||
        (!dateRange.from && dateRange.to && recordDate <= dateRange.to);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [paymentRecords, searchTerm, statusFilter, dateRange]);



  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
            <CreditCard className="h-8 w-8" />
            Payment Reports
          </h1>
          <p className="text-purple-100">View payment analytics, transaction history and financial reports</p>
        </div>
      </div>

      {/* Custom Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">
          {/* First Row: Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by student name or ID..."
                className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Filter by payment status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Picker */}
            <div className="w-full sm:w-64">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      "Select date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => setDateRange(range ?? { from: undefined, to: undefined })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Second Row: Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-11 px-4 border-gray-200 hover:border-gray-300 w-full sm:w-auto"
            >
              Clear Filters
            </Button>
            <Button
              variant="outline"
              onClick={fetchPayments}
              className="h-11 px-4 border-gray-200 hover:border-gray-300 w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => setIsPaymentRecordOpen(true)}
              className="h-11 px-4 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <>
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <TransactionTable
            transactions={filteredRecords}
            loading={loading}
            onEditStatus={handleEditPaymentStatus}
            onDelete={handleDeletePayment}
          />
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          <Card className="shadow-lg rounded-lg">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl font-semibold">Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <LoadingSpinner text="Loading payment records..." />
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No transactions found</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 sm:grid sm:grid-cols-2 sm:place-items-center">
                  {filteredRecords.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      onEditStatus={handleEditPaymentStatus}
                      onDelete={handleDeletePayment}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </>

      {/* Payment Record Modal */}
      <PaymentRecordModal
        open={isPaymentRecordOpen}
        onOpenChange={(open) => {
          setIsPaymentRecordOpen(open);
          if (!open) {
            setEditingPayment(null);
          }
        }}
        onRecordAdded={() => {
          fetchPayments();
          setEditingPayment(null);
        }}
        editingPayment={editingPayment}
      />

      {/* Payment Status Modal */}
      <PaymentStatusModal
        open={isPaymentStatusOpen}
        onOpenChange={(open) => {
          setIsPaymentStatusOpen(open);
          if (!open) {
            setEditingPaymentStatus(null);
          }
        }}
        onStatusUpdated={() => {
          fetchPayments();
          setEditingPaymentStatus(null);
        }}
        orderData={editingPaymentStatus}
      />
    </div>
  );
};

export default AdminPaymentReports;
