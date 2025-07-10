import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, CreditCard } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

const AdminPaymentReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  const paymentRecords = useMemo(() => [
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
  ], []);

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
    return paymentRecords.filter(record => {
      const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || record.status.toLowerCase() === statusFilter;
      const matchesDate = !dateFilter || record.date === formatDate(dateFilter);
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [paymentRecords, searchTerm, statusFilter, dateFilter]);

  // Define columns for shadcn DataTable
  const columns: ColumnDef<typeof paymentRecords[0]>[] = [
    { accessorKey: 'studentId', header: 'Student ID' },
    { accessorKey: 'studentName', header: 'Student Name' },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => `$${row.original.amount.toFixed(2)}` },
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'method', header: 'Method' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'items', header: 'Items', cell: ({ row }) => row.original.items.join(', ') },
  ];

  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <CreditCard className="h-8 w-8" />
            Payment Reports
          </h1>
          <p className="text-purple-100">View payment analytics, transaction history and financial reports</p>
        </div>
      </div>

      <Card className="shadow-lg rounded-lg">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl font-semibold">Transaction History</CardTitle>
          <CardDescription>Filter and search through payment records</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="search">Search Student</Label>
              <Input
                type="text"
                id="search"
                placeholder="Enter student name or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All" />
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
            <div>
              <Label>Filter by Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Input
                    id="date"
                    placeholder="Select a date"
                    value={formatDate(dateFilter)}
                    className={cn(
                      "bg-white text-sm font-medium pl-10",
                      !dateFilter && "text-muted-foreground"
                    )}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    className="rounded-md border-0"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="overflow-x-auto">
            <DataTable columns={columns} data={filteredRecords} searchKey="studentName" searchPlaceholder="Search student..." />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaymentReports;
