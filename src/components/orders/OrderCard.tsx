'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/features/gamification/components/badge';
import { Button } from '@/components/ui/button';
import { YellowRating } from '@/components/ui/rating';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPaymentStatusClass } from '@/utils/statusSystem';

interface OrderCardProps {
  order: {
    id: string;
    friendly_id?: string;
    created_at: string;
    payment_status: string;
    total_amount: number;
    order_items?: {
      quantity: number;
      rating?: number;
      review_comment?: string;
      rated_at?: string;
      products?: {
        id: string;
        name: string;
      };
    }[];
  };
  onPayNow?: () => void;
  onReorder?: () => void;
  onRateProduct?: () => void;
  onDownloadInvoice?: () => void;
  onCancelOrder?: () => void;
  onUnmarkCancelled?: () => void;
  showRating?: boolean;
  productImage?: string;
  className?: string;
  isAdminMode?: boolean;
  isProcessing?: boolean;
}

const formatOrderId = (order: OrderCardProps['order']) =>
  order.friendly_id || `ORD${order.id.substring(0, 4).toUpperCase()}`;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(value);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(',', '').toUpperCase();
};



const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'delivered':
      return 'Paid';
    case 'unpaid':
    case 'pending':
      return 'Unpaid';
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    default:
      return status.toUpperCase();
  }
};

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPayNow,
  onReorder,
  onRateProduct,
  onDownloadInvoice,
  onCancelOrder,
  onUnmarkCancelled,
  showRating = false,
  productImage,
  className,
  isAdminMode = false,
  isProcessing = false
}) => {
  const firstItem = order.order_items?.[0];
  const totalItems = order.order_items?.length || 0;
  const userRating = firstItem?.rating || 0;
  const hasRating = !!firstItem?.rated_at;

  // Calculate total quantity across all items
  const totalQuantity = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Use Order ID as the main title
  const orderTitle = formatOrderId(order);
  const isPaid = order.payment_status.toLowerCase() === 'paid';
  const isUnpaid = order.payment_status.toLowerCase() === 'unpaid';

  return (
    <Card className={cn(
      "bg-gradient-to-br from-gray-100 to-gray-200 border-0 shadow-xl rounded-2xl overflow-hidden relative w-full",
      // Fixed height to prevent content overflow
      "h-48",
      className
    )}>
      <CardContent className="p-3 relative h-full overflow-hidden">
        {/* Status Badge - Top Right */}
        <div className="absolute top-2 right-2 z-10">
          <span
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 font-bold rounded-full shadow-md border text-xs",
              getPaymentStatusClass(order.payment_status)
            )}
            style={{ fontSize: '9px' }}
          >
            {getStatusText(order.payment_status)}
          </span>
        </div>

        {/* Download Icon - Top Right Corner */}
        {isPaid && (
          <div className="absolute top-2 right-14 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownloadInvoice}
              className="px-1.5 py-0.5 hover:bg-white/50 rounded-full bg-white/30 shadow-md"
              style={{ height: '22px' }}
            >
              <Download className="w-3 h-3 text-gray-600" />
            </Button>
          </div>
        )}

        {/* Main Layout: Two Columns */}
        <div className="h-full flex gap-3">
          {/* Left Column - Product Image (Full Height) */}
          <div className="flex-shrink-0">
            <div className="w-24 h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg flex items-center justify-center overflow-hidden border border-gray-200">
              {productImage ? (
                <img
                  src={productImage}
                  alt={orderTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <img
                    src="/placeholder.svg"
                    alt={orderTitle}
                    className="w-16 h-16 object-contain opacity-60"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="flex-1 flex flex-col h-full min-w-0">
            {/* Top Section - Product Info & Order Details */}
            <div className="flex-1 space-y-1 overflow-hidden">
              {/* Order ID as Title */}
              <div className="w-full text-left">
                <h1 className="text-lg font-black text-gray-900 tracking-wide leading-tight truncate text-left">
                  {orderTitle}
                </h1>
              </div>

              {/* Rating - Show user's rating if available, otherwise show placeholder */}
              <div className="flex justify-start">
                {hasRating ? (
                  <YellowRating value={userRating} readOnly size={12} showValue />
                ) : (
                  <YellowRating defaultValue={0} readOnly size={12} />
                )}
              </div>

              {/* Order Information */}
              <div className="space-y-0.5 font-bold text-gray-900 overflow-hidden" style={{ fontSize: '10px' }}>
                {/* Very Small Screens (below 320px) - Wrapping Layout */}
                <div className="block min-[320px]:hidden text-left">
                  <div className="space-y-0.5 text-left">
                    <div className="text-left">
                      <div className="text-left" style={{ fontSize: '10px' }}>ITEMS:</div>
                      <div className="text-left" style={{ fontSize: '10px' }}>{totalItems} item{totalItems !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-left" style={{ fontSize: '10px' }}>PLACED ON:</div>
                      <div className="text-left" style={{ fontSize: '9px' }}>{formatDate(order.created_at)}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-left" style={{ fontSize: '10px' }}>QUANTITY:</div>
                      <div className="text-left" style={{ fontSize: '10px' }}>{totalQuantity}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-left" style={{ fontSize: '10px' }}>ITEM TOTAL:</div>
                      <div className="text-left" style={{ fontSize: '10px' }}>{formatCurrency(order.total_amount)}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-left" style={{ fontSize: '10px' }}>STATUS:</div>
                      <div className={cn(
                        "font-black text-left",
                        isPaid ? "text-green-600" : "text-red-600"
                      )} style={{ fontSize: '10px' }}>
                        {getStatusText(order.payment_status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Normal Screens (320px and above) - Aligned Layout */}
                <div className="hidden min-[320px]:block">
                  <div className="flex items-center">
                    <span className="w-24 text-left flex-shrink-0" style={{ fontSize: '10px' }}>ITEMS</span>
                    <span style={{ fontSize: '10px' }}>:</span>
                    <span className="text-left ml-1" style={{ fontSize: '10px' }}>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-left flex-shrink-0" style={{ fontSize: '10px' }}>PLACED ON</span>
                    <span style={{ fontSize: '10px' }}>:</span>
                    <span className="text-left ml-1" style={{ fontSize: '9px' }}>{formatDate(order.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-left flex-shrink-0" style={{ fontSize: '10px' }}>QUANTITY</span>
                    <span style={{ fontSize: '10px' }}>:</span>
                    <span className="text-left ml-1" style={{ fontSize: '10px' }}>{totalQuantity}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-left flex-shrink-0" style={{ fontSize: '10px' }}>ITEM TOTAL</span>
                    <span style={{ fontSize: '10px' }}>:</span>
                    <span className="text-left ml-1" style={{ fontSize: '10px' }}>{formatCurrency(order.total_amount)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 text-left flex-shrink-0" style={{ fontSize: '10px' }}>STATUS</span>
                    <span style={{ fontSize: '10px' }}>:</span>
                    <span className={cn(
                      "font-black text-left ml-1",
                      isPaid ? "text-green-600" : "text-red-600"
                    )} style={{ fontSize: '10px' }}>
                      {getStatusText(order.payment_status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section - Action Buttons */}
            <div className="mt-1">
              {isAdminMode ? (
                // Admin Mode - Show Cancel/Unmark buttons
                <div>
                  {order.payment_status === 'cancelled' ? (
                    <Button
                      onClick={onUnmarkCancelled}
                      size="sm"
                      variant="outline"
                      disabled={isProcessing}
                      className="w-full bg-white/90 border border-gray-300 text-gray-700 hover:bg-white rounded-full font-bold px-2 py-0.5 shadow-md text-xs h-6"
                    >
                      {isProcessing ? 'Processing...' : 'Unmark Cancelled'}
                    </Button>
                  ) : order.payment_status === 'paid' ? (
                    <div className="w-full text-center text-xs text-gray-500 py-1">
                      No actions available
                    </div>
                  ) : (
                    <Button
                      onClick={onCancelOrder}
                      size="sm"
                      variant="destructive"
                      disabled={isProcessing}
                      className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full font-bold px-2 py-0.5 shadow-md text-xs h-6"
                    >
                      {isProcessing ? 'Cancelling...' : 'Cancel Order'}
                    </Button>
                  )}
                </div>
              ) : (
                // User Mode - Show Reorder/Pay Now buttons
                <div>
                  {showRating && isPaid && (
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onRateProduct}
                        className="flex-1 bg-white/90 border border-gray-300 text-gray-700 hover:bg-white rounded-full font-bold px-2 py-0.5 shadow-md text-xs h-6"
                      >
                        {hasRating ? 'View Rating' : 'Rate Product'}
                      </Button>
                      <Button
                        onClick={onReorder}
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold px-2 py-0.5 shadow-md text-xs h-6"
                      >
                        Reorder
                      </Button>
                    </div>
                  )}

                  {isPaid && !showRating && (
                    <Button
                      onClick={onReorder}
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full font-bold px-2 py-0.5 shadow-md text-xs h-6"
                    >
                      Reorder
                    </Button>
                  )}

                  {isUnpaid && onPayNow && (
                    <Button
                      onClick={onPayNow}
                      size="sm"
                      className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full font-bold px-2 py-0.5 shadow-md text-xs h-6"
                    >
                      Pay Now
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card >
  );
};