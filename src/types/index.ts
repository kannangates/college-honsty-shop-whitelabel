/**
 * Central Types Export File
 * Production-ready type definitions for the entire application
 * This file re-exports all domain-specific types for easier imports
 * 
 * Usage:
 * import type { User, Product, Order } from '@/types';
 * import type { CartItem, DashboardData } from '@/types/common';
 * import type { SignupRequest, UpdatePointsRequest } from '@/types/api';
 */

// Auth & User Management
export type { UserProfile, AuthSession, AuthUser, AuthResult, SignupResult, LoginResult } from './auth';

// Database & Domain Models
export type {
  User,
  Product,
  DatabaseProduct,
  Order,
  DatabaseOrder,
  UserRole,
  PaymentMode,
  NotificationType,
  PaymentStatus,
  DatabasePaymentStatus,
} from './database';

// Common & Component Types
export * from './common';

// API Request/Response Types
export * from './api';

// Branding & Configuration
export type { ThemeJSON, FormsConfig, AppConfig, SystemConfig, ConfigJSON, MessagesJSON } from './branding';

// Supabase & API
export * from './supabase';
