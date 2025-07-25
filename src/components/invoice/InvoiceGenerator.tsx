import React from 'react';
import { generateInvoiceData, formatIndianCurrency } from '@/utils/orderUtils';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface InvoiceGeneratorProps {
  order: {
    id: string;
    total_amount: number;
    payment_mode?: string;
    transaction_id?: string;
    paid_at?: string;
    user?: {
      name: string;
      email: string;
    };
    order_items?: Array<{
      quantity: number;
      unit_price: number;
      total_price: number;
      products?: {
        name: string;
      };
    }>;
  };
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ order }) => {
  const generateAndDownloadInvoice = () => {
    if (!order.user || !order.order_items) {
      console.error('Missing required order data for invoice generation');
      return;
    }

    const invoiceData = generateInvoiceData({
      id: order.id,
      user_name: order.user.name,
      user_email: order.user.email,
      items: order.order_items.map(item => ({
        name: item.products?.name || 'Unknown Product',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      })),
      total_amount: order.total_amount,
      payment_mode: order.payment_mode,
      transaction_id: order.transaction_id,
      paid_at: order.paid_at
    });

    // Create a simple HTML invoice
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f2f2f2; }
          .totals { text-align: right; }
          .terms { margin-top: 30px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${invoiceData.seller.name}</h1>
          <p>${invoiceData.seller.address}</p>
          <p>Phone: ${invoiceData.seller.phone} | Email: ${invoiceData.seller.email}</p>
        </div>
        
        <div class="invoice-details">
          <div>
            <h3>Invoice To:</h3>
            <p><strong>${invoiceData.buyer.name}</strong></p>
            <p>${invoiceData.buyer.email}</p>
            <p>${invoiceData.buyer.address}</p>
          </div>
          <div>
            <h3>Invoice Details:</h3>
            <p><strong>Invoice #:</strong> ${invoiceData.invoiceNumber}</p>
            <p><strong>Order ID:</strong> ${invoiceData.orderId}</p>
            <p><strong>Date:</strong> ${invoiceData.invoiceDate.toLocaleDateString('en-IN')}</p>
            <p><strong>Payment Mode:</strong> ${invoiceData.paymentMode}</p>
            ${invoiceData.transactionId ? `<p><strong>Transaction ID:</strong> ${invoiceData.transactionId}</p>` : ''}
          </div>
        </div>
        
        <table class="table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.items.map(item => `
              <tr>
                <td>${item.srNo}</td>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${formatIndianCurrency(item.unitPrice)}</td>
                <td>${formatIndianCurrency(item.totalPrice)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <p><strong>Subtotal: ${formatIndianCurrency(invoiceData.subtotal)}</strong></p>
          ${invoiceData.gstAmount > 0 ? `<p>GST (${invoiceData.gstRate * 100}%): ${formatIndianCurrency(invoiceData.gstAmount)}</p>` : ''}
          <h3>Total: ${formatIndianCurrency(invoiceData.totalAmount)}</h3>
        </div>
        
        <div class="terms">
          <h4>Terms & Conditions:</h4>
          ${invoiceData.terms.map(term => `<p>• ${term}</p>`).join('')}
        </div>
      </body>
      </html>
    `;

    // Create and download the invoice
    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoiceData.invoiceNumber.replace(/[\s/]/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Only show for paid orders
  if (order.payment_mode && order.paid_at) {
    return (
      <Button
        onClick={generateAndDownloadInvoice}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Download Invoice
      </Button>
    );
  }

  return null;
};