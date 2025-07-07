import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

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

  return (
    <div className="container mx-auto py-10">
      <Card className="shadow-lg rounded-lg">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl font-semibold">Payment Reports</CardTitle>
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.studentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${record.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.items.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaymentReports;
