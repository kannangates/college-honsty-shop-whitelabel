# Reorder Checkout Flow

This directory contains the reorder functionality that allows users to quickly reorder items from their previous orders.

## Components

### ReorderModal
- **Purpose**: Displays a modal with order items and payment options
- **Features**:
  - Shows all items from the previous order
  - Displays total amount
  - Provides "Pay Now" and "Pay Later" options
  - Uses existing cart and checkout logic

### useReorder Hook
- **Purpose**: Manages reorder modal state and logic
- **Features**:
  - Opens/closes reorder modal
  - Handles order item selection
  - Provides reorder initiation function

## How It Works

1. **User clicks "Reorder"** on any order card in MyOrders page
2. **Modal opens** showing:
   - All items from the selected order
   - Total amount calculation
   - Two payment options (Pay Now / Pay Later)
3. **User selects payment option**:
   - **Pay Now**: Creates order and redirects to payment page
   - **Pay Later**: Creates order and redirects to orders page
4. **Order is created** using existing cart/checkout logic:
   - Items are added to cart
   - Checkout function is called
   - Stock is updated
   - Badges are awarded

## Integration

The reorder functionality integrates with existing systems:
- **Cart System**: Uses `useCart` hook for adding items and checkout
- **Payment Flow**: Uses existing payment URLs and navigation
- **Order Management**: Creates orders using the same logic as regular checkout
- **Stock Management**: Updates inventory through existing stock system

## Usage

```tsx
import { useReorder } from '@/hooks/useReorder';
import { ReorderModal } from '@/components/checkout/ReorderModal';

const MyComponent = () => {
  const { 
    isReorderModalOpen, 
    selectedOrderItems, 
    selectedOrderNumber, 
    initiateReorder, 
    closeReorderModal 
  } = useReorder();

  return (
    <>
      <button onClick={() => initiateReorder(order)}>
        Reorder
      </button>
      
      <ReorderModal
        isOpen={isReorderModalOpen}
        onClose={closeReorderModal}
        orderItems={selectedOrderItems}
        orderNumber={selectedOrderNumber}
      />
    </>
  );
};
```