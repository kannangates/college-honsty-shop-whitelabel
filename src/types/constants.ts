/**
 * Constants & Enum Types
 * Centralized type-safe constants used across the application
 */

// ============================================================================
// USER & ROLES
// ============================================================================

export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  DEVELOPER: 'developer',
} as const;

export type UserRoleType = typeof USER_ROLES[keyof typeof USER_ROLES];

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const;

export type UserStatusType = typeof USER_STATUS[keyof typeof USER_STATUS];

// ============================================================================
// PAYMENT & ORDERS
// ============================================================================

export const PAYMENT_STATUS = {
  PAID: 'paid',
  UNPAID: 'unpaid',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatusType = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export const PAYMENT_MODES = {
  QR_MANUAL: 'qr_manual',
  RAZORPAY: 'razorpay',
  PAY_LATER: 'pay_later',
} as const;

export type PaymentModeType = typeof PAYMENT_MODES[keyof typeof PAYMENT_MODES];

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatusType = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const NOTIFICATION_TYPES = {
  TOP_RANK_CHANGE: 'top_rank_change',
  BADGE_EARNED: 'badge_earned',
  ANNOUNCEMENT: 'announcement',
  PAYMENT_REMINDER: 'payment_reminder',
  ORDER_PLACED: 'order_placed',
  PAYMENT_RECEIVED: 'payment_received',
  GENERAL_ANNOUNCEMENT: 'general_announcement',
  STUDENT_PROMOTION: 'student_promotion',
  NEW_PRODUCT_ALERT: 'new_product_alert',
} as const;

export type NotificationTypeConstant = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// ============================================================================
// SHIFTS
// ============================================================================

export const SHIFTS = {
  MORNING: 'Morning (1st Shift)',
  EVENING: 'Evening (2nd Shift)',
  FULL: 'Full Shift',
} as const;

export type ShiftType = typeof SHIFTS[keyof typeof SHIFTS];

// ============================================================================
// STOCK & INVENTORY
// ============================================================================

export const STOCK_OPERATIONS = {
  RESTOCK_WAREHOUSE: 'restock_warehouse',
  RESTOCK_SHELF: 'restock_shelf',
  ADJUST_SHELF_STOCK: 'adjust_shelf_stock',
  GET_STOCK_STATUS: 'get_stock_status',
} as const;

export type StockOperationType = typeof STOCK_OPERATIONS[keyof typeof STOCK_OPERATIONS];

export const STOCK_SOURCES = {
  PRODUCT_INVENTORY: 'Product Inventory',
  ORDER_MANAGEMENT: 'Order Management',
  CHECKOUT: 'Checkout',
} as const;

export type StockSourceType = typeof STOCK_SOURCES[keyof typeof STOCK_SOURCES];

export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
} as const;

export type StockStatusType = typeof STOCK_STATUS[keyof typeof STOCK_STATUS];

// ============================================================================
// BADGE TYPES
// ============================================================================

export const BADGE_TYPES = {
  ACHIEVEMENT: 'achievement',
  STREAK: 'streak',
  MILESTONE: 'milestone',
  SPECIAL: 'special',
} as const;

export type BadgeTypeConstant = typeof BADGE_TYPES[keyof typeof BADGE_TYPES];

export const BADGE_CRITERIA = {
  XP_THRESHOLD: 'xp_threshold',
  STREAK_PAID_ORDERS: 'streak_paid_orders',
  EARLY_PAYMENTS: 'early_payments',
  ORDERS_COUNT: 'orders_count',
  AMOUNT_PAID_TOTAL: 'amount_paid_total',
  ACCOUNT_AGE: 'account_age',
} as const;

export type BadgeCriteriaType = typeof BADGE_CRITERIA[keyof typeof BADGE_CRITERIA];

// ============================================================================
// PRODUCT CATEGORIES
// ============================================================================

export const PRODUCT_CATEGORIES = {
  SNACKS: 'snacks',
  BEVERAGES: 'beverages',
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DESSERTS: 'desserts',
  OTHERS: 'others',
} as const;

export type ProductCategoryType = typeof PRODUCT_CATEGORIES[keyof typeof PRODUCT_CATEGORIES];

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_SIGNUP: '/auth/signup',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  
  // User Management
  USER_PROFILE: '/user/profile',
  USER_UPDATE: '/user/update',
  USER_DELETE: '/user/delete',
  USER_LIST: '/user/list',
  
  // Orders
  ORDER_CREATE: '/order/create',
  ORDER_GET: '/order/get',
  ORDER_LIST: '/order/list',
  ORDER_UPDATE: '/order/update',
  
  // Products
  PRODUCT_LIST: '/product/list',
  PRODUCT_GET: '/product/get',
  PRODUCT_CREATE: '/product/create',
  PRODUCT_UPDATE: '/product/update',
  
  // Stock
  STOCK_UPDATE: '/stock/update',
  STOCK_GET: '/stock/get',
  
  // Points
  POINTS_UPDATE: '/points/update',
  POINTS_GET: '/points/get',
  
  // Badges
  BADGE_LIST: '/badge/list',
  BADGE_AWARD: '/badge/award',
  
  // Notifications
  NOTIFICATION_LIST: '/notification/list',
  NOTIFICATION_CREATE: '/notification/create',
  NOTIFICATION_UPDATE: '/notification/update',
} as const;

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatusType = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

// ============================================================================
// TIME CONSTANTS
// ============================================================================

export const TIME_UNITS = {
  MILLISECONDS: 1,
  SECONDS: 1000,
  MINUTES: 60 * 1000,
  HOURS: 60 * 60 * 1000,
  DAYS: 24 * 60 * 60 * 1000,
  WEEKS: 7 * 24 * 60 * 60 * 1000,
} as const;

// ============================================================================
// VALIDATION CONSTRAINTS
// ============================================================================

export const VALIDATION = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  STUDENT_ID_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  PHONE_MAX_LENGTH: 20,
  DESCRIPTION_MAX_LENGTH: 500,
  DEPARTMENT_MAX_LENGTH: 100,
  REASON_MAX_LENGTH: 500,
} as const;

// ============================================================================
// PAGINATION
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
} as const;

// ============================================================================
// TOAST MESSAGES
// ============================================================================

export const TOAST_MESSAGES = {
  SUCCESS: 'Operation successful!',
  ERROR: 'An error occurred. Please try again.',
  LOADING: 'Loading...',
  SAVED: 'Changes saved successfully!',
  DELETED: 'Item deleted successfully!',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

export type ErrorCodeType = typeof ERROR_CODES[keyof typeof ERROR_CODES];
