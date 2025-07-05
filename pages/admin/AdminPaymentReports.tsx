import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, Filter, Calendar, RefreshCw } from 'lucide-react';

const AdminReports = () => {
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPaymentMode, setFilterPaymentMode] = useState('all');
  const [showFiltered, setShowFiltered] = useState(false);

  // Sample payment records - in real app, this would come from database
  const paymentRecords = [
    {
      id: '1',
      orderId: 'ORD-001',
      studentId: '569',
      studentName: 'Radhika',
      amount: 150.00,
      paymentMode: 'razorpay',
      transactionId: 'pay_ABC123',
      status: 'paid',
      createdAt: '2025-05-29T10:30:00Z',
      paidAt: '2025-05-29T10:31:00Z'
    },
    {
      id: '2',
      orderId: 'ORD-002',
      studentId: '570',
      studentName: 'John Doe',
      amount: 75.50,
      paymentMode: 'manual',
      transactionId: 'TXN123456',
      status: 'paid',
      createdAt: '2025-05-28T14:15:00Z',
      paidAt: '2025-05-28T15:20:00Z'
    },
    {
      id: '3',
      orderId: 'ORD-003',
      studentId: '571',
      studentName: 'Jane Smith',
      amount: 200.00,
      paymentMode: 'qr_upload',
      transactionId: 'QR789012',
      status: 'pending',
      createdAt: '2025-05-27T09:45:00Z',
      paidAt: null
    },
    {
      id: '4',
      orderId: 'ORD-004',
      studentId: '572',
      studentName: 'Mike Johnson',
      amount: 120.00,
      paymentMode: 'razorpay',
      transactionId: 'pay_DEF456',
      status: 'failed',
      createdAt: '2025-05-26T16:20:00Z',
      paidAt: null
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 text-xs">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 text-xs">Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getPaymentModeBadge = (mode: string) => {
    switch (mode) {
      case 'razorpay':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Razorpay</Badge>;
      case 'manual':
        return <Badge className="bg-purple-100 text-purple-800 text-xs">Manual</Badge>;
      case 'qr_upload':
        return <Badge className="bg-gray-100 text-gray-800 text-xs">QR Upload</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{mode}</Badge>;
    }
  };

  // Memoized filtered records
  const filteredRecords = useMemo(() => {
    return paymentRecords.filter(record => {
      if (filterStatus !== 'all' && record.status !== filterStatus) return false;
      if (filterPaymentMode !== 'all' && record.paymentMode !== filterPaymentMode) return false;
      
      // Date range filtering
      if (dateRange.from && new Date(record.createdAt) < new Date(dateRange.from)) return false;
      if (dateRange.to && new Date(record.createdAt) > new Date(dateRange.to + 'T23:59:59')) return false;
      
      return true;
    });
  }, [paymentRecords, filterStatus, filterPaymentMode, dateRange]);

  const handleApplyFilters = () => {
    setShowFiltered(true);
    console.log('Applying filters...', { filterStatus, filterPaymentMode, dateRange });
  };

  const handleExportReport = () => {
    console.log('Exporting payment report...', filteredRecords);
    // Implementation for exporting report
  };

  const handleRefreshData = () => {
    console.log('Refreshing payment data...');
    // Implementation for refreshing data
  };

  const displayedRecords = showFiltered ? filteredRecords : paymentRecords;

  const totalRevenue = displayedRecords
    .filter(record => record.status === 'paid')
    .reduce((sum, record) => sum + record.amount, 0);

  const pendingAmount = displayedRecords
    .filter(record => record.status === 'pending')
    .reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="space-y-4 text-sm">
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-4 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Payment Reports</h1>
        <p className="text-purple-100 text-sm">View payment analytics and reports</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-green-800">₹{totalRevenue.toFixed(2)}</div>
            <div className="text-xs text-green-600">Total Revenue</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-yellow-800">₹{pendingAmount.toFixed(2)}</div>
            <div className="text-xs text-yellow-600">Pending Amount</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-blue-800">{displayedRecords.length}</div>
            <div className="text-xs text-blue-600">Total Transactions</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-purple-800">
              {displayedRecords.filter(r => r.status === 'paid').length}
            </div>
            <div className="text-xs text-purple-600">Successful Payments</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Export */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters & Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <Label htmlFor="fromDate" className="text-xs">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="text-sm h-8"
              />
            </div>
            <div>
              <Label htmlFor="toDate" className="text-xs">To Date</Label>
              <Input
                id="toDate"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="text-sm h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Payment Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="text-sm h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Payment Mode</Label>
              <Select value={filterPaymentMode} onValueChange={setFilterPaymentMode}>
                <SelectTrigger className="text-sm h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="qr_upload">QR Upload</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApplyFilters} className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-8">
                <Filter className="h-4 w-4 mr-1" />
                Apply Filters
              </Button>
              <Button onClick={handleRefreshData} variant="outline" className="text-sm h-8">
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
            <Button onClick={handleExportReport} className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white text-sm h-8">
              <Download className="h-4 w-4 mr-1" />
              Export ({displayedRecords.length})
            </Button>
          </div>
          
          {showFiltered && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Showing {filteredRecords.length} filtered results out of {paymentRecords.length} total records.
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => setShowFiltered(false)}
                  className="text-blue-600 underline p-0 h-auto ml-2"
                >
                  Clear filters
                </Button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Records Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            Payment Records {showFiltered && `(${filteredRecords.length} filtered)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Order ID</TableHead>
                <TableHead className="text-xs">Student</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs">Payment Mode</TableHead>
                <TableHead className="text-xs">Transaction ID</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Created At</TableHead>
                <TableHead className="text-xs">Paid At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium text-sm">{record.orderId}</TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <div className="font-medium">{record.studentName}</div>
                      <div className="text-xs text-gray-500">{record.studentId}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">₹{record.amount.toFixed(2)}</TableCell>
                  <TableCell>{getPaymentModeBadge(record.paymentMode)}</TableCell>
                  <TableCell className="text-sm font-mono">{record.transactionId}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="text-sm">{formatDate(record.createdAt)}</TableCell>
                  <TableCell className="text-sm">
                    {record.paidAt ? formatDate(record.paidAt) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;
