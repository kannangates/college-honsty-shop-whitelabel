/**
 * Generates a unique order ID in Indian format
 * Format: ORD-YYYYMMDD-HHMMSS-XXX
 * Where XXX is a random 3-digit number
 */
export const generateOrderId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `ORD-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
};

/**
 * Generates a unique invoice number in Indian format
 * Format: INV/YYYY-YY/XXXXXX
 * Where YYYY-YY is financial year and XXXXXX is sequential number
 */
export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-based
  
  // Indian financial year runs from April to March
  let financialYearStart: number;
  let financialYearEnd: number;
  
  if (currentMonth >= 4) {
    // If current month is April or later, we're in the current financial year
    financialYearStart = currentYear;
    financialYearEnd = currentYear + 1;
  } else {
    // If current month is January to March, we're in the previous financial year
    financialYearStart = currentYear - 1;
    financialYearEnd = currentYear;
  }
  
  // Generate sequential number (in production, this should come from database)
  const sequentialNumber = Math.floor(Math.random() * 999999) + 1;
  const paddedNumber = sequentialNumber.toString().padStart(6, '0');
  
  return `INV/${financialYearStart}-${String(financialYearEnd).slice(-2)}/${paddedNumber}`;
};

/**
 * Formats amount in Indian rupees format with commas
 */
export const formatIndianCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Generates invoice data structure for Indian GST invoice
 */
export const generateInvoiceData = (orderData: {
  id: string;
  user_name: string;
  user_email: string;
  user_address?: string;
  items: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  total_amount: number;
  payment_mode?: string;
  transaction_id?: string;
  paid_at?: string;
}) => {
  const invoiceNumber = generateInvoiceNumber();
  const invoiceDate = new Date();
  
  // Calculate totals
  const subtotal = orderData.items.reduce((sum, item) => sum + item.total_price, 0);
  const gstRate = 0; // No GST for educational institution items typically
  const gstAmount = subtotal * gstRate;
  const totalAmount = subtotal + gstAmount;
  
  return {
    invoiceNumber,
    invoiceDate,
    orderId: orderData.id,
    
    // Seller details (College)
    seller: {
      name: "Shasun Jairam College",
      address: "College Address Line 1\nCollege Address Line 2\nCity, State - PIN",
      gstin: "", // Add college GSTIN if applicable
      phone: "College Phone Number",
      email: "college@shasuncollege.edu.in"
    },
    
    // Buyer details (Student)
    buyer: {
      name: orderData.user_name,
      email: orderData.user_email,
      address: orderData.user_address || "Student Address Not Provided"
    },
    
    // Items
    items: orderData.items.map((item, index) => ({
      srNo: index + 1,
      description: item.name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price
    })),
    
    // Calculations
    subtotal,
    gstRate,
    gstAmount,
    totalAmount,
    
    // Payment details
    paymentMode: orderData.payment_mode || 'Cash',
    transactionId: orderData.transaction_id || '',
    paidAt: orderData.paid_at ? new Date(orderData.paid_at) : null,
    
    // Terms and conditions
    terms: [
      "Goods once sold cannot be returned or exchanged",
      "Payment should be made as per agreed terms", 
      "Subject to college jurisdiction",
      "This is a computer generated invoice"
    ]
  };
};