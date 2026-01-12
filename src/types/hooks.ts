/**
 * Custom Hooks Type Definitions
 * Types for all custom React hooks used across the application
 */

import type { Product, User, Order } from './database';
import type { CartItem, DashboardData, Badge, Notification } from './common';

// ============================================================================
// CART HOOK
// ============================================================================

export interface UseCartReturn {
  items: CartItem[];
  isLoading: boolean;
  totalAmount: number;
  itemCount: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: () => Promise<{ success: boolean; order?: Order; error?: string }>;
}

// ============================================================================
// AUTH HOOK
// ============================================================================

export type AuthResponse = {
  success: boolean;
  session?: unknown;
  user?: User;
  token?: string;
  error?: string;
};

export interface UseAuthReturn {
  user: User | null;
  profile: User | null;
  session: AuthResponse | null;
  isLoading: boolean;
  isAdmin: boolean;
  isDeveloper: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  login: (studentId: string, password: string) => Promise<AuthResponse>;
  signup: (data: SignupData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  resetPassword: (studentId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; user?: User; error?: string }>;
  isAuthenticated: boolean;
}

export interface SignupData {
  studentId: string;
  name: string;
  email: string;
  password: string;
  department: string;
  shift?: string;
  skipCaptcha?: boolean;
}

// ============================================================================
// DASHBOARD HOOK
// ============================================================================

export interface UseDashboardDataReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  todaysStats: {
    todays_orders?: number;
    total_revenue?: number;
  };
  refetch: () => Promise<void>;
}

// ============================================================================
// NOTIFICATIONS HOOK
// ============================================================================

export interface UseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  pinNotification: (id: string, pinTill?: string) => Promise<void>;
  unpinNotification: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

// ============================================================================
// BADGE/GAMIFICATION HOOK
// ============================================================================

export interface UseBadgeServiceReturn {
  badges: Badge[];
  userBadges: Badge[];
  isLoading: boolean;
  error: string | null;
  getBadges: () => Promise<Badge[]>;
  awardBadgesForUser: (userId: string, badgeIds: string[]) => Promise<{ success: boolean; awarded?: Badge[]; error?: string }>;
  removeBadge: (userId: string, badgeId: string) => Promise<void>;
  getUserBadges: (userId: string) => Promise<Badge[]>;
}

// ============================================================================
// STOCK MANAGEMENT HOOK
// ============================================================================

export interface UseStockManagementReturn {
  stocks: unknown;
  isLoading: boolean;
  error: string | null;
  adjustStock: (productId: string, quantity: number, operation: string) => Promise<void>;
  getStockStatus: (productId: string) => Promise<{ quantity: number; status: string; warning?: boolean }>;
  importStock: (file: File) => Promise<{ success: boolean; imported?: number; errors?: string[] }>;
}// ============================================================================
// FORM HOOKS
// ============================================================================

export type FormState = {
  isSubmitting: boolean;
  isValidating: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
};

export interface UseFormReturn<T extends Record<string, unknown>> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValidating: boolean;
  isDirty: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (e: React.FormEvent) => Promise<void>;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  resetForm: () => void;
  setFieldError: (field: string, error: string) => void;
}

// ============================================================================
// RESPONSIVE HOOK
// ============================================================================

export interface UseResponsiveReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}

// ============================================================================
// PERFORMANCE HOOK
// ============================================================================

export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export interface UsePerformanceOptimizationReturn {
  metrics: PerformanceMetrics;
  recordMetric: (name: string, value: number) => void;
  reportMetrics: () => void;
}

// ============================================================================
// TOAST/NOTIFICATION HOOK
// ============================================================================

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface UseToastReturn {
  toast: (options: Omit<Toast, 'id'>) => void;
  toasts: Toast[];
  dismissToast: (id: string) => void;
  dismissAllToasts: () => void;
}

// ============================================================================
// WEBSOCKET HOOK
// ============================================================================

export interface UseWebSocketReturn {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  data: unknown;
  send: (data: unknown) => void;
  subscribe: (event: string, callback: (data: unknown) => void) => () => void;
  unsubscribe: (event: string) => void;
  disconnect: () => void;
}

// ============================================================================
// ISO COMPLIANCE HOOK
// ============================================================================

export interface UseISOComplianceReturn {
  isCompliant: boolean;
  complianceStatus: Record<string, boolean>;
  checkCompliance: () => Promise<void>;
  generateReport: () => Promise<string>;
}

// ============================================================================
// N8N INTEGRATION HOOK
// ============================================================================

export interface UseN8nIntegrationReturn {
  triggerWorkflow: (workflowName: string, data: unknown) => Promise<{ success: boolean; result?: unknown; error?: string }>;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// DATA EXPORT HOOK
// ============================================================================

export interface UseDataExportReturn {
  exportToCSV: <T extends Record<string, unknown>>(data: T[], filename: string) => void;
  exportToExcel: <T extends Record<string, unknown>>(data: T[], filename: string) => Promise<void>;
  exportToJSON: <T extends Record<string, unknown>>(data: T, filename: string) => void;
  exportToPDF: <T extends Record<string, unknown>>(data: T, filename: string) => Promise<void>;
  isExporting: boolean;
  error: string | null;
}
