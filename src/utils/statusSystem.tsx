/**
 * Centralized Status System
 * Handles all status types, payment methods, and their styling across the application
 */

import React from 'react';
import {
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  QrCode,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package
} from 'lucide-react';

// ============================================================================
// PAYMENT STATUS SYSTEM
// ============================================================================

export type PaymentStatus = 'paid' | 'unpaid' | 'cancelled' | 'completed' | 'pending' | 'processing' | 'shipped' | 'delivered';

export const getPaymentStatusClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'completed':
    case 'delivered':
      return 'payment-status-paid';
    case 'unpaid':
    case 'pending':
      return 'payment-status-unpaid';
    case 'cancelled':
      return 'payment-status-cancelled';
    case 'processing':
      return 'payment-status-processing';
    case 'shipped':
      return 'payment-status-shipped';
    default:
      return 'payment-status-default';
  }
};

export const getPaymentIconClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'completed':
    case 'delivered':
      return 'payment-icon-paid';
    case 'unpaid':
    case 'pending':
      return 'payment-icon-unpaid';
    case 'cancelled':
      return 'payment-icon-cancelled';
    case 'processing':
      return 'payment-icon-processing';
    case 'shipped':
      return 'payment-icon-shipped';
    default:
      return 'payment-icon-default';
  }
};

export const getPaymentBackgroundClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'completed':
    case 'delivered':
      return 'payment-bg-paid';
    case 'unpaid':
    case 'pending':
      return 'payment-bg-unpaid';
    case 'cancelled':
      return 'payment-bg-cancelled';
    case 'processing':
      return 'payment-bg-processing';
    case 'shipped':
      return 'payment-bg-shipped';
    default:
      return 'payment-bg-default';
  }
};

export const getPaymentBadgeClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'delivered':
    case 'completed':
      return 'payment-badge-paid';
    case 'unpaid':
    case 'pending':
      return 'payment-badge-unpaid';
    case 'processing':
      return 'payment-badge-processing';
    case 'shipped':
      return 'payment-badge-shipped';
    case 'cancelled':
      return 'payment-badge-cancelled';
    default:
      return 'payment-badge-default';
  }
};

// ============================================================================
// PAYMENT METHODS SYSTEM
// ============================================================================

export type PaymentMethod = 'qr_manual' | 'razorpay' | 'pay_later' | 'cash' | 'upi' | 'card' | 'credit_card' | 'net_banking';

export interface PaymentMethodConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
}

export const PAYMENT_METHODS: Record<PaymentMethod, PaymentMethodConfig> = {
  qr_manual: {
    label: 'QR Manual',
    icon: QrCode,
    color: 'text-purple-600',
    description: 'Manual QR code payment'
  },
  razorpay: {
    label: 'Razorpay',
    icon: CreditCard,
    color: 'text-blue-600',
    description: 'Razorpay gateway payment'
  },
  pay_later: {
    label: 'Pay Later',
    icon: Clock,
    color: 'text-orange-600',
    description: 'Deferred payment option'
  },
  cash: {
    label: 'Cash',
    icon: Banknote,
    color: 'text-green-600',
    description: 'Cash payment'
  },
  upi: {
    label: 'UPI',
    icon: Smartphone,
    color: 'text-blue-600',
    description: 'Unified Payments Interface'
  },
  card: {
    label: 'Card',
    icon: CreditCard,
    color: 'text-purple-600',
    description: 'Credit/Debit card payment'
  },
  credit_card: {
    label: 'Credit Card',
    icon: CreditCard,
    color: 'text-purple-600',
    description: 'Credit card payment'
  },
  net_banking: {
    label: 'Net Banking',
    icon: Building2,
    color: 'text-green-600',
    description: 'Internet banking'
  }
};

export const getPaymentMethodConfig = (method: string): PaymentMethodConfig => {
  const normalizedMethod = method.toLowerCase().replace(/\s+/g, '_') as PaymentMethod;
  return PAYMENT_METHODS[normalizedMethod] || {
    label: method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    icon: CreditCard,
    color: 'text-gray-600',
    description: 'Payment method'
  };
};

export const getPaymentMethodIcon = (method: string, status?: string) => {
  const config = getPaymentMethodConfig(method);
  const IconComponent = config.icon;
  const colorClass = status ? getPaymentIconClass(status) : config.color;

  return <IconComponent className={`h-4 w-4 ${colorClass}`} />;
};

export const formatPaymentMethod = (method: string): string => {
  return getPaymentMethodConfig(method).label;
};

// ============================================================================
// GENERAL STATUS SYSTEM (for products, users, etc.)
// ============================================================================

export type GeneralStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'archived';

export const getGeneralStatusClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'status-active';
    case 'inactive':
      return 'status-inactive';
    case 'pending':
      return 'status-pending';
    case 'suspended':
      return 'status-suspended';
    case 'archived':
      return 'status-archived';
    default:
      return 'status-default';
  }
};

export const getGeneralStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'inactive':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'pending':
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    case 'suspended':
      return <XCircle className="h-4 w-4 text-orange-600" />;
    case 'archived':
      return <Package className="h-4 w-4 text-gray-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />;
  }
};

// ============================================================================
// STOCK STATUS SYSTEM
// ============================================================================

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export const getStockStatus = (stock: number, lowThreshold: number = 10): StockStatus => {
  if (stock === 0) return 'out_of_stock';
  if (stock <= lowThreshold) return 'low_stock';
  return 'in_stock';
};

export const getStockStatusClass = (stock: number, lowThreshold?: number): string => {
  const status = getStockStatus(stock, lowThreshold);
  switch (status) {
    case 'in_stock':
      return 'stock-in-stock';
    case 'low_stock':
      return 'stock-low-stock';
    case 'out_of_stock':
      return 'stock-out-of-stock';
    default:
      return 'stock-default';
  }
};

export const getStockStatusLabel = (stock: number, lowThreshold?: number): string => {
  const status = getStockStatus(stock, lowThreshold);
  switch (status) {
    case 'in_stock':
      return 'In Stock';
    case 'low_stock':
      return 'Low Stock';
    case 'out_of_stock':
      return 'Out of Stock';
    default:
      return 'Unknown';
  }
};

export const getStockBadgeClass = (stock: number, lowThreshold?: number): string => {
  if (stock === 0) return 'stock-empty';
  if (stock <= (lowThreshold || 10)) return 'stock-low-stock';
  return 'stock-good';
};

export const getStockBadgeLabel = (stock: number, lowThreshold?: number): string => {
  if (stock === 0) return 'Empty';
  if (stock <= (lowThreshold || 10)) return 'Low';
  return 'Good';
};

// ============================================================================
// COMPLIANCE SYSTEM
// ============================================================================

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending';

export const getComplianceClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'compliant':
      return 'compliance-compliant';
    case 'non_compliant':
    case 'non-compliant':
      return 'compliance-non-compliant';
    case 'pending':
      return 'compliance-pending';
    default:
      return 'compliance-pending';
  }
};

// ============================================================================
// PERFORMANCE SCORE SYSTEM
// ============================================================================

export const getScoreClass = (score: number): string => {
  if (score >= 90) return 'score-excellent';
  if (score >= 75) return 'score-good';
  if (score >= 50) return 'score-average';
  return 'score-poor';
};

// ============================================================================
// NOTIFICATION TYPE SYSTEM
// ============================================================================

export type NotificationType = 'top_rank_change' | 'badge_earned' | 'announcement' | 'payment_reminder';

export const getNotificationClass = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'top_rank_change':
      return 'notification-achievement';
    case 'badge_earned':
      return 'notification-badge-earned';
    case 'announcement':
      return 'notification-announcement';
    case 'payment_reminder':
      return 'notification-payment';
    default:
      return 'notification-default';
  }
};

export const getNotificationEmoji = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'top_rank_change':
      return '🏆';
    case 'badge_earned':
      return '🎖️';
    case 'announcement':
      return '📢';
    case 'payment_reminder':
      return '💸';
    default:
      return '📝';
  }
};

// ============================================================================
// COMMON BADGE UTILITIES
// ============================================================================

export const getBadgeVariantClass = (variant: string): string => {
  switch (variant.toLowerCase()) {
    case 'success':
      return 'badge-success';
    case 'warning':
      return 'badge-warning';
    case 'error':
    case 'destructive':
      return 'badge-error';
    case 'info':
      return 'badge-info';
    case 'item':
    case 'secondary':
      return 'badge-item';
    case 'tag':
      return 'badge-tag';
    default:
      return 'badge-info';
  }
};

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

// Keep old function names for backward compatibility
export const getPaymentStatusColors = (status: string) => ({
  badge: getPaymentStatusClass(status),
  icon: getPaymentIconClass(status),
  background: getPaymentBackgroundClass(status)
});

export const getStatusColor = getPaymentStatusClass; // Legacy alias