/**
 * Product Categories
 * Centralized list of product categories used across the application
 */
export const PRODUCT_CATEGORIES = [
  'Beverages',
  'Snacks',
  'Dairy',
  'Bakery',
  'Frozen Foods',
  'Groceries',
  'Personal Care',
  'Household',
  'Others'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
