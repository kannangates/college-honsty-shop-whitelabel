/**
 * API Request & Response Types
 * Type definitions for all API endpoints and edge functions
 */

import type { User, Product, Order } from './database';

// ============================================================================
// AUTH APIs
// ============================================================================

export interface SignupRequest {
  studentId: string;
  name: string;
  department: string;
  email: string;
  password: string;
  role?: 'student' | 'admin' | 'teacher' | 'developer';
  shift?: 'Morning (1st Shift)' | 'Evening (2nd Shift)' | 'Full Shift';
  points?: number;
  userMetadata?: Record<string, unknown>;
  skipCaptcha?: boolean;
}

export interface LoginRequest {
  studentId: string;
  password: string;
}

export interface ForgotPasswordRequest {
  studentId: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface MFASetupRequest {
  userId: string;
}

export interface MFAVerifyRequest {
  token: string;
  code: string;
}

export interface CaptchaVerificationRequest {
  token: string;
  secretKey: string;
}

export interface CaptchaVerificationResponse {
  success: boolean;
  error?: string | string[];
}

// ============================================================================
// USER MANAGEMENT APIs
// ============================================================================

export interface UserManagementRequest {
  operation: 'fetch_user_summary' | 'fetch_user_details' | 'fetch_leaderboard' | 'update_user' | 'get_stats' | 'update_last_signin';
  targetUserId?: string;
  reason?: string;
  mfaToken?: string;
  id?: string;
  name?: string;
  email?: string;
  department?: string;
  mobile_number?: string;
  status?: 'active' | 'inactive' | 'suspended';
  role?: 'student' | 'teacher' | 'admin' | 'developer';
  shift?: 'Morning (1st Shift)' | 'Evening (2nd Shift)' | 'Full Shift';
  userId?: string;
}

export interface UpdateUserRoleRequest {
  userId: string;
  newRole: 'student' | 'teacher' | 'admin' | 'developer';
}

export interface AdminResetPasswordRequest {
  userId: string;
  newPassword: string;
}

export interface UserSummary {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  adminUsers: number;
}

// ============================================================================
// ORDER MANAGEMENT APIs
// ============================================================================

export interface OrderManagementRequest {
  operation: 'fetch_orders' | 'get_stats' | 'update_order';
  id?: string;
  payment_status?: 'paid' | 'unpaid' | 'pending' | 'refunded';
  order_status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  transaction_id?: string;
  updated_by?: string;
}

export interface OrderStats {
  todayOrders: number;
  revenue: number;
  pendingOrders: number;
  avgOrder: number;
}

// ============================================================================
// PRODUCT & STOCK MANAGEMENT APIs
// ============================================================================

export interface StockManagementRequest {
  operation: 'restock_warehouse' | 'restock_shelf' | 'adjust_shelf_stock' | 'get_stock_status';
  productId: string;
  quantity: number;
  source?: 'Product Inventory' | 'Order Management' | 'Checkout';
}

export interface StockStatus {
  warehouse_stock: number;
  shelf_stock: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
}

export interface InventoryUpdateRequest {
  operation: 'save' | 'sync' | 'export';
  date?: string;
  data?: InventoryOperationItem[];
  format?: 'excel' | 'csv';
}

export interface InventoryOperationItem {
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

// ============================================================================
// POINTS & BADGES APIs
// ============================================================================

export interface UpdatePointsRequest {
  studentId: string;
  points: number;
  reason: string;
}

export interface AwardBadgeRequest {
  userId: string;
  orderId?: string;
}

export interface BadgeAwardResponse {
  newBadges: string[];
  totalBadges: number;
  userPoints: number;
}

// ============================================================================
// NOTIFICATIONS APIs
// ============================================================================

export interface CreateNotificationRequest {
  title: string;
  body: string;
  type: 'order_placed' | 'payment_received' | 'general_announcement' | 'student_promotion' | 'new_product_alert' | 'badge_earned' | 'top_rank_change' | 'payment_reminder';
  imageUrl?: string;
  department?: string[];
  targetUserId?: string;
  pinTill?: string;
}

export interface UpdateNotificationRequest {
  id: string;
  isRead?: boolean;
  isPinned?: boolean;
  pinTill?: string;
  reachCount?: number;
  sharedCount?: number;
}

// ============================================================================
// EMAIL & COMMUNICATION APIs
// ============================================================================

export interface EmailRequest {
  to: string;
  subject: string;
  htmlBody: string;
  plainTextBody?: string;
  cc?: string[];
  replyTo?: string;
  fromName?: string;
  fromEmail?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ============================================================================
// DASHBOARD & ANALYTICS APIs
// ============================================================================

export interface DashboardDataRequest {
  type?: 'full' | 'stats' | 'leaderboard' | 'stock';
  userId?: string;
  department?: string;
}

export interface DashboardDataResponse {
  stats: {
    totalOrders: number;
    userPendingOrders: number;
    todayUnpaidOrders: number;
    totalUnpaidOrdersValue: number;
    topDepartments: Array<{
      department: string;
      points: number;
      rank: number;
    }>;
  };
  topStudents: Array<{
    student_id: string;
    name: string;
    department: string;
    points: number;
    rank: number;
  }>;
  userRank: number;
  stockData: Array<{
    id: string;
    name: string;
    quantity: number;
    threshold: number;
  }>;
}

// ============================================================================
// SYSTEM & ADMIN APIs
// ============================================================================

export interface UpdateWhitelabelRequest {
  config: Record<string, unknown>;
}

export interface DatabaseSchemaRequest {
  type?: 'full' | 'tables' | 'functions' | 'policies';
}

export interface UpdateTableStatsRequest {
  table: string;
  action: 'refresh' | 'analyze' | 'vacuum';
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: ValidationErrorDetail[];
  code?: string;
  status: number;
}

// ============================================================================
// GENERIC RESPONSE WRAPPERS
// ============================================================================

export interface PagedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface BulkResponse<T> {
  successful: T[];
  failed: Array<{
    id: string;
    error: string;
  }>;
}
