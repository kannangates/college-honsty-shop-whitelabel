import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/features/gamification/components/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { getPaymentStatusClass, getPaymentIconClass, getPaymentBackgroundClass, getPaymentMethodIcon, formatPaymentMethod, getBadgeVariantClass } from '@/utils/statusSystem';

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

interface TransactionCardProps {
  transaction: PaymentRecord;
  onEditStatus?: (transaction: PaymentRecord) => void;
  onDelete?: (transactionId: string) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEditStatus,
  onDelete
}) => {








  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd-MMM-yyyy');
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  const isStaticRecord = !!transaction.items; // Static records have items array

  return (
    <Card className="w-full max-w-sm bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Left Column - Payment Icon */}
          <div className="flex-shrink-0">
            <div className={`w-16 h-16 rounded-lg border flex items-center justify-center ${getPaymentBackgroundClass(transaction.status)}`}>
              {React.cloneElement(getPaymentMethodIcon(transaction.method, transaction.status), { className: "h-6 w-6" })}
            </div>
          </div>

          {/* Right Column - Transaction Info */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                  {transaction.studentName}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {transaction.studentId}
                </p>
              </div>
              {/* Status Badge */}
              <Badge
                variant="outline"
                className={`text-xs ${getPaymentStatusClass(transaction.status)}`}
              >
                {transaction.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Amount */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-700">Amount</span>
            <span className="text-xl font-bold text-green-600">₹{transaction.amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-3">
          {/* Date */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date
            </span>
            <span className="text-sm font-medium text-gray-900">{formatDate(transaction.date)}</span>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Method</span>
            <div className="flex items-center gap-2">
              {getPaymentMethodIcon(transaction.method, transaction.status)}
              <span className="text-sm font-medium text-gray-900">{formatPaymentMethod(transaction.method)}</span>
            </div>
          </div>

          {/* Transaction ID */}
          {transaction.transactionId && transaction.transactionId !== 'N/A' && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Transaction ID
              </span>
              <span className="text-sm font-medium text-gray-900 truncate max-w-24" title={transaction.transactionId}>
                {transaction.transactionId}
              </span>
            </div>
          )}

          {/* Order ID */}
          {transaction.orderId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Order ID
              </span>
              <span className="text-sm font-medium text-gray-900">{transaction.orderId}</span>
            </div>
          )}

          {/* Items (for static records) */}
          {transaction.items && transaction.items.length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600 mb-2 block">Items:</span>
              <div className="flex flex-wrap gap-1">
                {transaction.items.map((item, index) => (
                  <Badge key={index} variant="outline" className={`text-xs ${getBadgeVariantClass('item')}`}>
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Only show for non-static records */}
        {!isStaticRecord && onEditStatus && (
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => onEditStatus(transaction)}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white border-0 h-10 text-sm font-medium"
              size="sm"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};