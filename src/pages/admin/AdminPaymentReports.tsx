import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, CreditCard, Search, RefreshCw, Plus, Edit, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { PaymentRecordModal } from '@/components/admin/PaymentRecordModal';
import { PaymentStatusModal } from '@/components/admin/PaymentStatusModal';
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

  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState<EditingPayment | null>(null);
  const [editingPaymentStatus, setEditingPaymentStatus] = useState<EditingPaymentStatus | null>(null);
  const { toast } = useToast();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
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

      if (error) throw error;

      const formattedData = data.map(order => {
        const getStatusLabel = (status: string) => {
          switch (status) {
            case 'paid': return 'Paid';
            case 'unpaid': return 'Unpaid';
            case 'cancelled': return 'Cancelled';
            case 'failed': return 'Unpaid'; // Map failed to unpaid for simplicity
            default: return 'Unpaid'; // Default to unpaid instead of pending
          }
        };

        return {
          id: order.id,
          studentId: order.users?.student_id || 'Unknown',
          studentName: order.users?.name || 'Unknown',
          amount: order.total_amount,
          date: order.paid_at ? format(new Date(order.paid_at), 'yyyy-MM-dd') : format(new Date(order.created_at), 'yyyy-MM-dd'),
          method: order.payment_mode || 'N/A',
          status: getStatusLabel(order.payment_status) as PaymentRecord['status'],
          transactionId: order.transaction_id || 'N/A',
          orderId: order.friendly_id || order.id.slice(0, 8),
          createdAt: order.created_at
        };
      });

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

  const handleEditPayment = (payment: PaymentRecord) => {
    setEditingPayment({
      id: payment.id,
      orderId: payment.orderId || payment.id,
      transactionId: payment.transactionId || '',
      paymentMethod: payment.method,
      paidAt: payment.date
    });
    setIsPaymentRecordOpen(true);
  };

  const handleEditPaymentStatus = (payment: PaymentRecord) => {
    setEditingPaymentStatus({
      id: payment.id,
      orderId: payment.orderId || payment.id,
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

  const staticRecords = useMemo(() => [
    {
      id: '1',
      studentId: 'STU001',
      studentName: 'John Doe',
      amount: 150.00,
      date: '2024-01-15',
      method: 'UPI',
      status: 'Paid' as const,
      items: ['Notebook', 'Pen']
    },
    {
      id: '2',
      studentId: 'STU002',
      studentName: 'Jane Smith',
      amount: 75.50,
      date: '2024-01-20',
      method: 'Credit Card',
      status: 'Unpaid' as const,
      items: ['Textbook']
    },
    {
      id: '3',
      studentId: 'STU003',
      studentName: 'Alice Johnson',
      amount: 200.00,
      date: '2024-01-22',
      method: 'Net Banking',
      status: 'Paid' as const,
      items: ['Calculator', 'Ruler', 'Protractor']
    },
    {
      id: '4',
      studentId: 'STU004',
      studentName: 'Bob Williams',
      amount: 50.00,
      date: '2024-01-25',
      method: 'UPI',
      status: 'Unpaid' as const,
      items: ['Graph Paper']
    },
    {
      id: '5',
      studentId: 'STU005',
      studentName: 'Charlie Brown',
      amount: 120.75,
      date: '2024-01-28',
      method: 'Credit Card',
      status: 'Paid' as const,
      items: ['Geometry Set', 'Eraser']
    },
    {
      id: '6',
      studentId: 'STU006',
      studentName: 'Diana Miller',
      amount: 90.20,
      date: '2024-02-01',
      method: 'Net Banking',
      status: 'Unpaid' as const,
      items: ['Highlighters', 'Sticky Notes']
    },
    {
      id: '7',
      studentId: 'STU007',
      studentName: 'Ethan Davis',
      amount: 180.00,
      date: '2024-02-05',
      method: 'UPI',
      status: 'Paid' as const,
      items: ['Drawing Pencils', 'Sketchbook']
    },
    {
      id: '8',
      studentId: 'STU008',
      studentName: 'Fiona Wilson',
      amount: 60.50,
      date: '2024-02-10',
      method: 'Credit Card',
      status: 'Unpaid' as const,
      items: ['Colored Pens']
    },
    {
      id: '9',
      studentId: 'STU009',
      studentName: 'George Thompson',
      amount: 140.00,
      date: '2024-02-12',
      method: 'Net Banking',
      status: 'Paid' as const,
      items: ['Scientific Calculator']
    },
    {
      id: '10',
      studentId: 'STU010',
      studentName: 'Hannah Garcia',
      amount: 80.00,
      date: '2024-02-15',
      method: 'UPI',
      status: 'Unpaid' as const,
      items: ['Whiteboard Markers']
    }
  ], []);

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All' },
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'cancelled', label: 'Cancelled' }
  ], []);

  const formatDate = (date: Date | undefined): string => {
    return date ? format(date, 'yyyy-MM-dd') : '';
  };

  const filteredRecords = useMemo(() => {
    const allRecords = [...paymentRecords, ...staticRecords];
    return allRecords.filter(record => {
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
  }, [paymentRecords, staticRecords, searchTerm, statusFilter, dateRange]);

  // Define columns for shadcn DataTable
  const columns: ColumnDef<PaymentRecord>[] = [
    { accessorKey: 'studentId', header: 'Student ID' },
    { accessorKey: 'studentName', header: 'Student Name' },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => `₹${row.original.amount.toFixed(2)}` },
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'method', header: 'Method' },
    { accessorKey: 'transactionId', header: 'Transaction ID' },
    { accessorKey: 'orderId', header: 'Order ID' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const getStatusColor = (status: string) => {
          switch (status.toLowerCase()) {
            case 'paid': return 'bg-green-100 text-green-800 border-green-200';
            case 'unpaid': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
          }
        };

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
            {status}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const payment = row.original;
        if (payment.items) return null; // Skip action buttons for static records

        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditPaymentStatus(payment)}
              className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
              title="Edit Payment Status"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {payment.status.toLowerCase() === 'paid' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeletePayment(payment.id)}
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                title="Mark as Unpaid"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      }
    },
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <CreditCard className="h-8 w-8" />
          Payment Reports
        </h1>
        <p className="text-purple-100 text-base ml-14">View payment analytics, transaction history and financial reports</p>
      </div>

      {/* Custom Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search Box */}
          <div className="relative flex-1 w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by student name or ID..."
              className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
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
          <div className="w-full lg:w-64">
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
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full lg:w-auto">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-11 px-4 border-gray-200 hover:border-gray-300"
            >
              Clear Filters
            </Button>
            <Button
              variant="outline"
              onClick={fetchPayments}
              className="h-11 px-4 border-gray-200 hover:border-gray-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => setIsPaymentRecordOpen(true)}
              className="h-11 px-4 bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </div>
      </div>

      {/* DataTable Section */}
      <Card className="shadow-lg rounded-lg">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl font-semibold">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <LoadingSpinner text="Loading payment records..." />
          ) : (
            <div className="overflow-x-auto">
              <DataTable columns={columns} data={filteredRecords} />
            </div>
          )}
        </CardContent>
      </Card>

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
