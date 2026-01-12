/**
 * Common & Component Types
 * Shared type definitions used across multiple components and pages
 */

import type { Product, User } from './database';

// ============================================================================
// CART & SHOPPING
// ============================================================================

export interface CartItem {
  id: string;
  name: string;
  unit_price: number;
  quantity: number;
  image_url?: string;
}

export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  totalAmount: number;
  itemCount: number;
}

export interface OrderRecord {
  id: string;
  friendly_id: string | null;
  total_amount: number;
  created_at?: string;
  payment_status?: string;
}

export interface CheckoutResult {
  success: boolean;
  order?: OrderRecord;
  error?: string;
}

// ============================================================================
// DASHBOARD & ANALYTICS
// ============================================================================

export interface DashboardStats {
  totalOrders: number;
  userPendingOrders: number;
  todayUnpaidOrders: number;
  totalUnpaidOrdersValue: number;
  topDepartments: Array<{
    department: string;
    points: number;
    rank: number;
  }>;
}

export interface LeaderboardStudent {
  student_id: string;
  name: string;
  department: string;
  points: number;
  rank: number;
  isCurrentUser?: boolean;
}

export interface StockInfo {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface DashboardData {
  stats: DashboardStats;
  topStudents: LeaderboardStudent[];
  userRank: number;
  stockData: StockInfo[];
}

export interface TodaysStats {
  todays_orders?: number;
  total_revenue?: number;
  pending_payments?: number;
}

// ============================================================================
// NOTIFICATIONS & MESSAGES
// ============================================================================

export type NotificationTypeEnum = 
  | 'top_rank_change'
  | 'badge_earned'
  | 'announcement'
  | 'payment_reminder'
  | 'order_placed'
  | 'payment_received'
  | 'general_announcement'
  | 'student_promotion'
  | 'new_product_alert';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: NotificationTypeEnum;
  created_at: string;
  is_pinned: boolean;
  pin_till?: string | null;
  department?: string[] | null;
  target_user_id?: string | null;
  reach_count: number;
  shared_count: number;
  is_read: boolean;
  read_at?: string | null;
  imageUrl?: string;
}

export interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onReactionUpdate: (id: string, type: 'reach' | 'share') => void;
}

// ============================================================================
// BADGES & GAMIFICATION
// ============================================================================

export interface Badge {
  id: string;
  name: string;
  description?: string;
  badge_type: string;
  min_points: number;
  criteria_type?: string;
  criteria_value?: number;
  is_active: boolean;
  image_url?: string;
  created_at?: string;
}

export interface UserBadge {
  id?: string;
  user_id?: string;
  badge_id: string;
  earned_at?: string;
  badge?: Badge;
}

export interface BadgeAwardResult {
  newBadges: string[];
  totalBadges: number;
  userPoints: number;
}

export interface BadgeStats {
  totalEarned: number;
  badges: Badge[];
  userBadges: UserBadge[];
}

// ============================================================================
// ORDERS & PAYMENTS
// ============================================================================

export interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  rating?: number;
  review_comment?: string;
  rated_at?: string;
  product?: Product;
  products?: {
    id: string;
    name: string;
    unit_price: number;
  };
}

export interface OrderWithItems {
  id: string;
  friendly_id?: string;
  created_at: string;
  updated_at?: string;
  payment_status: string;
  payment_mode?: string;
  transaction_id?: string;
  paid_at?: string;
  total_amount: number;
  user_id?: string;
  users?: {
    name: string;
    email: string;
    student_id?: string;
  };
  order_items?: OrderItem[];
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  friendlyId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMode: string;
  transactionId?: string;
  paidAt?: string;
  studentName: string;
  studentId: string;
  email: string;
  createdAt: string;
}

// ============================================================================
// ADMIN & MANAGEMENT
// ============================================================================

export interface InventoryOperation {
  product_id: string;
  opening_stock: number;
  additional_stock: number;
  actual_closing_stock: number;
  estimated_closing_stock: number;
  stolen_stock: number;
  wastage_stock: number;
  sales: number;
  order_count: number;
}

export interface InventoryRecord extends InventoryOperation {
  id?: string;
  created_at: string;
}

export interface StockOperation {
  operation: 'restock_warehouse' | 'restock_shelf' | 'adjust_shelf_stock' | 'get_stock_status';
  productId: string;
  quantity: number;
  source?: 'Product Inventory' | 'Order Management' | 'Checkout';
}

export interface DatabaseSchema {
  tables: TableInfo[];
  functions: FunctionInfo[];
  policies: PolicyInfo[];
}

export interface TableInfo {
  name: string;
  columns: ColumnInfo[];
  rowCount: number;
}

export interface ColumnInfo {
  name: string;
  type: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
}

export interface FunctionInfo {
  name: string;
  returnType: string;
  parameters: ParameterInfo[];
}

export interface ParameterInfo {
  name: string;
  type: string;
}

export interface PolicyInfo {
  name: string;
  table: string;
  operation: string;
  definition: string;
}

// ============================================================================
// PRODUCT & INVENTORY
// ============================================================================

export interface ProductCardProps {
  product: Product;
  quantity: number;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: string) => void;
}

export interface ProductFilter {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export interface ProductStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

// ============================================================================
// SYSTEM & METADATA
// ============================================================================

export interface SystemMetrics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  platformVersion: string;
  lastUpdated: string;
  uptime: string;
  activeUsers: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  timestamp: string;
}

export interface PageProps {
  initialMode?: 'login' | 'recovery';
}

// ============================================================================
// UI COMPONENT PROPS
// ============================================================================

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// ============================================================================
// ERROR & VALIDATION
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: ValidationError[];
}

export interface FormError {
  general?: string;
  fields?: Record<string, string>;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: Record<string, unknown>;
}

export type ApiResponseType<T> = SuccessResponse<T> | ErrorResponse;
