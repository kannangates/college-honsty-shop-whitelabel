/**
 * Product Categories
 * Centralized list of product categories used across the application
 */
export const PRODUCT_CATEGORIES = [
  'Art Supplies',
  'Books',
  'Clothing',
  'Paper Products',
  'Pens',
  'Personal Care',
  'Stationery',
  'Tech Accessories',
  'Others'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];







