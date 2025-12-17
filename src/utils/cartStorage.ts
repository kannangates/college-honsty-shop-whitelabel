/**
 * Utility functions for user-specific cart localStorage operations
 */

interface CartItem {
  id: string;
  name: string;
  unit_price: number;
  quantity: number;
  image_url?: string;
}

const CART_STORAGE_PREFIX = 'cart-items';

/**
 * Generate user-specific storage key
 */
const getStorageKey = (userId?: string): string => {
  if (!userId) {
    // Fallback to generic key for anonymous users
    return `${CART_STORAGE_PREFIX}-anonymous`;
  }
  return `${CART_STORAGE_PREFIX}-${userId}`;
};

export const cartStorage = {
  /**
   * Load cart items from localStorage for specific user
   */
  load: (userId?: string): CartItem[] => {
    try {
      const storageKey = getStorageKey(userId);
      const savedCart = localStorage.getItem(storageKey);
      if (!savedCart) return [];

      const parsed = JSON.parse(savedCart);

      // Validate the structure
      if (!Array.isArray(parsed)) return [];

      return parsed.filter(item =>
        item &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.unit_price === 'number' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
      );
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  },

  /**
   * Save cart items to localStorage for specific user
   */
  save: (items: CartItem[], userId?: string): void => {
    try {
      const storageKey = getStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  },

  /**
   * Clear cart from localStorage for specific user
   */
  clear: (userId?: string): void => {
    try {
      const storageKey = getStorageKey(userId);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error);
    }
  },

  /**
   * Clear all cart data for all users (admin function)
   */
  clearAll: (): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CART_STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing all cart data from localStorage:', error);
    }
  },

  /**
   * Check if localStorage is available
   */
  isAvailable: (): boolean => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
};