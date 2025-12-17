# Cart Caching Implementation

## Overview

The cart now includes persistent storage using localStorage, ensuring that cart
items are preserved across browser sessions and page refreshes.

## Features

✅ **Automatic Persistence**: Cart items are automatically saved to localStorage
whenever the cart changes ✅ **Page Refresh Resilience**: Cart contents persist
after page refreshes ✅ **User-Specific Storage**: Each user has their own cart
data, preventing cart sharing between users ✅ **Error Handling**: Graceful
fallback when localStorage is unavailable ✅ **Data Validation**: Validates cart
data structure when loading from storage ✅ **Clean Checkout**: Cart is properly
cleared from both memory and storage after successful checkout ✅ **User
Switching**: Cart automatically switches when users log in/out

## Implementation Details

### Files Modified/Added

1. **`src/hooks/useCart.ts`** - Enhanced with localStorage integration
2. **`src/utils/cartStorage.ts`** - New utility for robust cart storage
   operations
3. **`src/utils/cartCacheDemo.ts`** - Demo and testing utilities

### Key Changes

- Cart state is initialized from localStorage on hook creation
- Cart changes are automatically saved to localStorage via useEffect
- Robust error handling for localStorage operations
- Data validation when loading from storage
- Proper cleanup on cart clear and checkout

### Storage Keys

Cart data is stored under user-specific localStorage keys:

- `cart-items-{userId}` for logged-in users
- `cart-items-anonymous` for anonymous users

## Usage

The cart caching works automatically with the existing `useCart` hook. No
changes are needed in components that use the cart.

```typescript
const { items, addItem, removeItem, clearCart } = useCart();
// Cart items will automatically persist across sessions
```

## Testing

### Manual Testing

1. Add items to cart
2. Refresh the page
3. Verify cart items are still present

### Browser DevTools

1. Open DevTools (F12)
2. Go to Application > Local Storage
3. Look for `cart-items` key to see stored data

### Demo Function

Run in browser console:

```javascript
import { demoCartPersistence } from "./src/utils/cartCacheDemo";
demoCartPersistence();
```

## Browser Compatibility

The cart caching feature includes fallbacks for environments where localStorage
is not available:

- Checks localStorage availability before operations
- Gracefully degrades to memory-only storage if localStorage is blocked
- No errors thrown if localStorage operations fail

## Data Structure

Cart items are stored as JSON with the following structure:

```typescript
interface CartItem {
  id: string;
  name: string;
  unit_price: number;
  quantity: number;
  image_url?: string;
}
```

## Security Considerations

- Cart data is stored locally in the browser only
- Each user has isolated cart data based on their user ID
- No sensitive payment information is cached
- Data is automatically cleared after successful checkout
- Users can manually clear cart data through browser settings
- Cart data automatically switches when different users log in/out

## Multi-User Support

The cart system now supports multiple users on the same device:

- Each user's cart is stored separately using their unique user ID
- When a user logs out and another logs in, they see only their own cart
- Anonymous users get a separate cart storage
- No cart data is shared between different users
