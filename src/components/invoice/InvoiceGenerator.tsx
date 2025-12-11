import React from 'react';
import { generateInvoiceData, formatIndianCurrency, convertNumberToWords } from '@/utils/orderUtils';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface InvoiceGeneratorProps {
  order: {
    id: string;
    friendly_id?: string;
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
  const generateAndDownloadInvoice = async () => {
    if (!order.user || !order.order_items) {
      console.error('Missing required order data for invoice generation');
      return;
    }

    const invoiceData = await generateInvoiceData({
      id: order.friendly_id || order.id,
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

    // Create Printo-style HTML invoice
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page {
            size: A4;
            margin: 15mm;
          }
          body { 
            font-family: Arial, sans-serif; 
            background: white;
            padding: 0;
            margin: 0;
            font-size: 12px;
            line-height: 1.4;
          }
          .invoice-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            border: 1px solid #ddd;
            padding: 20mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
          }
          .content-wrapper {
            flex: 1;
          }
          @media print {
            body { background: white; }
            .invoice-container { 
              border: none; 
              padding: 0;
              margin: 0;
              width: 100%;
              min-height: 100vh;
            }
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            border-bottom: 2px solid #eee;
            padding-bottom: 15px;
          }
          .logo-section {
            flex: 1;
          }
          .logo-section h1 {
            color: #ff6b35;
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .logo-section p {
            font-size: 10px;
            color: #666;
            line-height: 1.3;
          }
          .invoice-title {
            text-align: right;
            flex: 1;
          }
          .invoice-title h2 {
            font-size: 26px;
            color: #5a67d8;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .invoice-meta {
            font-size: 11px;
            color: #666;
            text-align: right;
          }
          .billing-section {
            margin-bottom: 30px;
          }
          .billing-section h3 {
            background: #f8f9fa;
            padding: 10px;
            margin-bottom: 15px;
            font-size: 16px;
            color: #333;
            border-left: 4px solid #5a67d8;
          }
          .billing-row {
            display: flex;
            gap: 40px;
            margin-bottom: 20px;
          }
          .bill-to, .ship-to {
            flex: 1;
          }
          .bill-to h4, .ship-to h4 {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
          }
          .address-block {
            font-size: 13px;
            line-height: 1.5;
            color: #333;
          }
          .products-section h3 {
            background: #f8f9fa;
            padding: 10px;
            margin-bottom: 0;
            font-size: 16px;
            color: #333;
            border-left: 4px solid #5a67d8;
          }
          .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 13px;
          }
          .products-table th {
            background: #f8f9fa;
            padding: 12px 8px;
            text-align: left;
            border: 1px solid #ddd;
            font-weight: bold;
            color: #333;
          }
          .products-table td {
            padding: 10px 8px;
            border: 1px solid #ddd;
            color: #333;
          }
          .products-table tr:nth-child(even) {
            background: #fafafa;
          }
          .total-section {
            text-align: right;
            margin-top: 20px;
            font-size: 14px;
          }
          .total-row {
            margin-bottom: 5px;
            color: #333;
          }
          .total-final {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            border-top: 2px solid #ddd;
            padding-top: 10px;
            margin-top: 10px;
          }
          .notes-section {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
          .notes-section h4 {
            margin-bottom: 10px;
            color: #333;
          }
          .amount-words {
            font-style: italic;
            color: #666;
            margin-top: 15px;
            margin-bottom: 20px;
            text-align: right;
          }
          .footer {
            text-align: center;
            margin-top: auto;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #5a67d8;
            font-weight: bold;
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="header">
            <div class="logo-section">
              <h1>${invoiceData.seller.name}</h1>
              <p>${invoiceData.seller.address.replace(/\n/g, '<br>')}</p>
              <p>Phone: ${invoiceData.seller.phone} | Email: ${invoiceData.seller.email}</p>
            </div>
            <div class="invoice-title">
              <h2>INVOICE</h2>
              <div class="invoice-meta">
                <div><strong>Challan No:</strong> ${invoiceData.invoiceNumber}</div>
                <div><strong>Date:</strong> ${invoiceData.invoiceDate.toLocaleDateString('en-GB')}</div>
                <div><strong>Sales Person:</strong> ${invoiceData.seller.name}</div>
              </div>
            </div>
          </div>

          <!-- Billing & Shipping Details -->
          <div class="billing-section">
            <h3>BILLING & SHIPPING DETAILS</h3>
            <div class="billing-row">
              <div class="bill-to">
                <h4>Billing Address</h4>
                <div class="address-block">
                  ${invoiceData.buyer.name}<br>
                  ${invoiceData.buyer.email}<br>
                  ${invoiceData.buyer.address}<br>
                  GST: ${invoiceData.seller.gstin || 'N/A'}
                </div>
              </div>
              <div class="ship-to">
                <h4>Shipping Address</h4>
                <div class="address-block">
                  ${invoiceData.seller.name}<br>
                  ${invoiceData.seller.address.replace(/\n/g, '<br>')}<br>
                  GST: ${invoiceData.seller.gstin || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <!-- Product Details -->
          <h3 class="products-section">PRODUCT DETAILS</h3>
          <table class="products-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ORDER ID</th>
                <th>PRODUCT NAME</th>
                <th>HSN CODE</th>
                <th>QTY</th>
                <th>AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.items.map(item => `
                <tr>
                  <td>${item.srNo}</td>
                  <td>${invoiceData.orderId}</td>
                  <td>${item.description}</td>
                  <td>${item.hsnCode}</td>
                  <td>${item.quantity}</td>
                  <td>${formatIndianCurrency(item.totalPrice).replace('₹', '')}</td>
                </tr>
              `).join('')}
              <tr style="border-top: 2px solid #333;">
                <td colspan="5" style="text-align: right; font-weight: bold;">Total:</td>
                <td style="font-weight: bold;">${formatIndianCurrency(invoiceData.totalAmount).replace('₹', '')}</td>
              </tr>
            </tbody>
          </table>

          <div class="amount-words">
            <strong>Amount in Words:</strong> ${convertNumberToWords(invoiceData.totalAmount)} Rupees
          </div>

          <!-- Notes -->
          <div class="notes-section">
            <h4>NOTES:</h4>
            <p>No special instructions.</p>
          </div>

          <!-- Footer -->
          <div class="footer">
            THIS IS COMPUTER GENERATED INVOICE, NO SIGNATURE IS NEEDED
          </div>
        </div>


      </body>
      </html>
    `;

    // Create and download the invoice
    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoiceData.invoiceNumber}.html`;
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