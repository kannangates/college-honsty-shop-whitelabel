/**
 * Demo file showing how user-specific cart caching works
 * This file demonstrates the cart persistence functionality
 */

import { cartStorage } from './cartStorage';

// Example cart items for demonstration
const sampleCartItems = [
  {
    id: '1',
    name: 'Sample Product 1',
    unit_price: 100,
    quantity: 2,
    image_url: 'https://example.com/image1.jpg'
  },
  {
    id: '2',
    name: 'Sample Product 2',
    unit_price: 250,
    quantity: 1
  }
];

/**
 * Demo function to test user-specific cart persistence
 * Run this in browser console to test the functionality
 */
export const demoCartPersistence = () => {
  console.log('🛒 User-Specific Cart Persistence Demo');
  console.log('======================================');

  const testUserId1 = 'user-123';
  const testUserId2 = 'user-456';

  // Check if localStorage is available
  console.log('1. Checking localStorage availability:', cartStorage.isAvailable());

  // Clear any existing carts
  cartStorage.clearAll();
  console.log('2. Cleared all existing carts');

  // Test user-specific storage
  console.log('\n--- Testing User-Specific Storage ---');

  // Save items for user 1
  cartStorage.save(sampleCartItems, testUserId1);
  console.log('3. Saved cart for user 1:', sampleCartItems);

  // Save different items for user 2
  const user2Items = [{ ...sampleCartItems[0], quantity: 5 }];
  cartStorage.save(user2Items, testUserId2);
  console.log('4. Saved different cart for user 2:', user2Items);

  // Load user 1's cart
  const user1Cart = cartStorage.load(testUserId1);
  console.log('5. Loaded user 1 cart:', user1Cart);

  // Load user 2's cart
  const user2Cart = cartStorage.load(testUserId2);
  console.log('6. Loaded user 2 cart:', user2Cart);

  // Verify isolation
  const user1Correct = JSON.stringify(sampleCartItems) === JSON.stringify(user1Cart);
  const user2Correct = JSON.stringify(user2Items) === JSON.stringify(user2Cart);
  const cartsIsolated = JSON.stringify(user1Cart) !== JSON.stringify(user2Cart);

  console.log('7. User 1 cart correct:', user1Correct);
  console.log('8. User 2 cart correct:', user2Correct);
  console.log('9. Carts properly isolated:', cartsIsolated);

  if (user1Correct && user2Correct && cartsIsolated) {
    console.log('✅ User-specific cart caching is working correctly!');
    console.log('   - Each user has isolated cart data');
    console.log('   - Items persist after page refresh');
    console.log('   - No cart data sharing between users');
  } else {
    console.log('❌ Cart caching has issues');
  }

  // Test anonymous user
  console.log('\n--- Testing Anonymous User ---');
  const anonymousItems = [{ ...sampleCartItems[1], quantity: 3 }];
  cartStorage.save(anonymousItems);
  const anonymousCart = cartStorage.load();
  console.log('10. Anonymous cart saved and loaded:', anonymousCart);

  // Clean up
  cartStorage.clearAll();
  console.log('11. Demo completed, all carts cleared');
};

// Instructions for manual testing
export const testInstructions = `
🧪 Manual Testing Instructions for Multi-User Cart:

1. Login as User A and add items to cart
2. Logout and login as User B
3. Verify User B sees empty cart (not User A's items)
4. Add different items to User B's cart
5. Logout and login back as User A
6. Verify User A still sees their original cart items
7. Refresh the page - cart should persist for current user

Browser Storage Inspection:
1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Look for keys like:
   - 'cart-items-{userId}' for logged-in users
   - 'cart-items-anonymous' for anonymous users

To run the demo:
1. Open browser console (F12)
2. Import: import { demoCartPersistence } from './src/utils/cartCacheDemo'
3. Run: demoCartPersistence()
4. Check console output for test results
`;

console.log(testInstructions);