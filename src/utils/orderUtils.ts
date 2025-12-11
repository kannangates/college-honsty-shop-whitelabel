/**
 * Generates a friendly order ID in format similar to HubJob ID
 * Format: 7-digit number (e.g., 4340752)
 */
export const generateOrderId = (): string => {
  // Generate a 7-digit number between 1000000 and 9999999
  const friendlyId = Math.floor(Math.random() * 9000000) + 1000000;
  return friendlyId.toString();
};

/**
 * Loads college configuration from config file
 */
const getCollegeConfig = async () => {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    return config.branding;
  } catch (error) {
    console.error('Failed to load college config:', error);
    throw new Error('Unable to load college configuration');
  }
};

/**
 * Generates college initials from college name
 */
const generateCollegeInitials = (collegeName: string): string => {
  return collegeName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};

/**
 * Generates invoice number in format: [COLLEGE_INITIALS]-INV-[NUMBER]
 * Format: SJC-INV-001 (e.g., for Shasun Jain College)
 */
export const generateInvoiceNumber = async (): Promise<string> => {
  try {
    const collegeConfig = await getCollegeConfig();
    const initials = generateCollegeInitials(collegeConfig.college_name);

    // Generate a 3-digit sequential number (in production, this should come from database)
    const sequentialNumber = Math.floor(Math.random() * 999) + 1;
    const paddedNumber = sequentialNumber.toString().padStart(3, '0');

    return `${initials}-INV-${paddedNumber}`;
  } catch (error) {
    console.error('Failed to generate invoice number:', error);
    // Fallback to simple format if config fails
    const sequentialNumber = Math.floor(Math.random() * 999) + 1;
    const paddedNumber = sequentialNumber.toString().padStart(3, '0');
    return `INV-${paddedNumber}`;
  }
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
export const generateInvoiceData = async (orderData: {
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
  const invoiceNumber = await generateInvoiceNumber();
  const invoiceDate = new Date();
  const collegeConfig = await getCollegeConfig();

  // Calculate totals
  const subtotal = orderData.items.reduce((sum, item) => sum + item.total_price, 0);
  const gstRate = 0; // No GST for educational institution items typically
  const gstAmount = subtotal * gstRate;
  const totalAmount = subtotal + gstAmount;

  return {
    invoiceNumber,
    invoiceDate,
    orderId: orderData.id,

    // Seller details (College) - from config
    seller: {
      name: collegeConfig.college_name,
      address: `${collegeConfig.address_line_1}\n${collegeConfig.address_line_2}\n${collegeConfig.city_state_pin}`,
      gstin: collegeConfig.gstin,
      phone: collegeConfig.phone,
      email: collegeConfig.email
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
      totalPrice: item.total_price,
      hsnCode: "39201099" // Default HSN code for stationery items
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

/**
 * Converts a number to words in Indian English format
 */
export const convertNumberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  function convertHundreds(n: number): string {
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result;
    }
    if (n > 0) {
      result += ones[n] + ' ';
    }
    return result;
  }

  let result = '';
  const crores = Math.floor(num / 10000000);
  if (crores > 0) {
    result += convertHundreds(crores) + 'Crore ';
    num %= 10000000;
  }

  const lakhs = Math.floor(num / 100000);
  if (lakhs > 0) {
    result += convertHundreds(lakhs) + 'Lakh ';
    num %= 100000;
  }

  const thousands = Math.floor(num / 1000);
  if (thousands > 0) {
    result += convertHundreds(thousands) + 'Thousand ';
    num %= 1000;
  }

  if (num > 0) {
    result += convertHundreds(num);
  }

  return result.trim();
};