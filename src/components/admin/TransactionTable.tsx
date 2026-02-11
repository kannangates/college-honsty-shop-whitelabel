import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/features/gamification/components/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Edit, Smartphone, Building2, Banknote, CreditCard, QrCode, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useDataExport } from '@/hooks/useDataExport';
import { format } from 'date-fns';
import { getPaymentStatusClass, getPaymentMethodIcon, formatPaymentMethod } from '@/utils/statusSystem';

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

interface TransactionTableProps {
  transactions: PaymentRecord[];
  loading: boolean;
  onEditStatus?: (transaction: PaymentRecord) => void;
  onDelete?: (transactionId: string) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  loading,
  onEditStatus,
  onDelete
}) => {
  const { exportData, isExporting } = useDataExport();







  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd-MMM-yyyy');
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  const handleExport = () => {
    const exportHeaders = [
      'Student ID', 'Student Name', 'Amount', 'Date', 'Payment Method', 'Transaction ID', 'Order ID', 'Status'
    ];

    const exportRows = transactions.map(transaction => [
      transaction.studentId,
      transaction.studentName,
      transaction.amount,
      transaction.date,
      transaction.method,
      transaction.transactionId || 'N/A',
      transaction.orderId || 'N/A',
      transaction.status
    ]);

    exportData({
      headers: exportHeaders,
      data: exportRows,
      filename: `transactions-${new Date().toISOString().split('T')[0]}`
    }, 'csv');
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-gray-800">Transaction History ({transactions.length})</CardTitle>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || transactions.length === 0}
            className="text-sm"
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <LoadingSpinner size="md" text="Loading transactions..." />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => {
                const isStaticRecord = !!transaction.items;
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.studentName}</p>
                        <p className="text-sm text-gray-500">{transaction.studentId}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">₹{transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(transaction.method, transaction.status)}
                        <span>{formatPaymentMethod(transaction.method)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.transactionId && transaction.transactionId !== 'N/A' ? (
                        <span className="font-mono text-sm" title={transaction.transactionId}>
                          {transaction.transactionId.length > 12
                            ? `${transaction.transactionId.slice(0, 12)}...`
                            : transaction.transactionId}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction.orderId ? (
                        <span className="font-mono text-sm">{transaction.orderId}</span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getPaymentStatusClass(transaction.status)}`}
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!isStaticRecord && onEditStatus && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditStatus(transaction)}
                          aria-label="Edit Status"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};