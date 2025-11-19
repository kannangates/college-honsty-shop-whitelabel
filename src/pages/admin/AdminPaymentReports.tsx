import React, { useState, useMemo, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const AdminPaymentReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [isPaymentRecordOpen, setIsPaymentRecordOpen] = useState(false);
  const [paymentRecords, setPaymentRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const { toast } = useToast();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          orders (
            id,
            friendly_id,
            users (name, student_id, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(payment => ({
        id: payment.id,
        studentId: payment.orders?.users?.student_id || 'Unknown',
        studentName: payment.orders?.users?.name || 'Unknown',
        amount: payment.amount,
        date: format(new Date(payment.paid_at), 'yyyy-MM-dd'),
        method: payment.payment_method || 'Manual',
        status: 'Paid' as const,
        transactionId: payment.transaction_id || 'N/A',
        orderId: payment.orders?.friendly_id || payment.order_id
      }));

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
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleEditPayment = (payment: any) => {
    setEditingPayment({
      id: payment.id,
      orderId: payment.orderId,
      transactionId: payment.transactionId,
      paymentMethod: payment.method,
      paidAt: payment.date
    });
    setIsPaymentRecordOpen(true);
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;

    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payment record deleted successfully'
      });

      fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete payment record',
        variant: 'destructive'
      });
    }
  };

  const staticRecords = [
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
      status: 'Pending' as const,
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
      status: 'Failed' as const,
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
      status: 'Pending' as const,
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
      status: 'Failed' as const,
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
      status: 'Pending' as const,
      items: ['Whiteboard Markers']
    }
  ];

  const allRecords = [...paymentRecords, ...staticRecords];

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ], []);

  const formatDate = (date: Date | undefined): string => {
    return date ? format(date, 'yyyy-MM-dd') : '';
  };

  const filteredRecords = useMemo(() => {
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
  }, [allRecords, searchTerm, statusFilter, dateRange]);

  // Define columns for shadcn DataTable
  const columns: ColumnDef<unknown>[] = [
    { accessorKey: 'studentId', header: 'Student ID' },
    { accessorKey: 'studentName', header: 'Student Name' },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => `₹${row.original.amount.toFixed(2)}` },
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'method', header: 'Method' },
    { accessorKey: 'transactionId', header: 'Transaction ID' },
    { accessorKey: 'orderId', header: 'Order ID' },
    { accessorKey: 'status', header: 'Status' },
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
              onClick={() => handleEditPayment(payment)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeletePayment(payment.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
    </div>
  );
};

export default AdminPaymentReports;
