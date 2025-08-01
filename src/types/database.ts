// Database types for the application
export type UserRole = 'student' | 'admin' | 'developer';
export type PaymentMode = 'online' | 'cash' | 'upi';
export type NotificationType = 'order_placed' | 'payment_received' | 'general_announcement' | 'student_promotion' | 'new_product_alert';

// Product type matching the database structure
export interface DatabaseProduct {
  id: string;
  name: string;
  unit_price: number;
  shelf_stock: number | null;
  warehouse_stock: number | null;
  status: string | null;
  is_archived: boolean | null;
  category: string;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  opening_stock: number;
  image_url: string | null;
}

// Application Product type
export interface Product extends DatabaseProduct {
  description?: string;
  price: number;
}

// User type
export interface User {
  id: string;
  name: string;
  email: string | null;
  student_id: string;
  department: string | null;
  role: UserRole | null;
  points: number | null;
  status: string;
  shift: string;
  mobile_number: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_signed_in_at: string | null;
  password_changed_at: string | null;
  updated_by: string | null;
}

// Order type
export interface Order {
  id: string;
  user_id: string | null;
  total_amount: number;
  payment_status: string | null;
  payment_mode: PaymentMode | null;
  transaction_id: string | null;
  friendly_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  updated_by: string | null;
  paid_at: string | null;
}