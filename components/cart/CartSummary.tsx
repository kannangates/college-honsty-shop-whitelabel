import React from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';

const CartSummary = () => {
  const { cart, getTotalAmount, clearCart } = useCart();

  if (cart.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  return (
    <div className="p-4 border rounded shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Cart Summary</h2>
      <ul className="mb-4">
        {cart.map(item => (
          <li key={item.id} className="flex justify-between mb-2">
            <span>{item.name} x {item.quantity}</span>
            <span>₹{item.unit_price * item.quantity}</span>
          </li>
        ))}
      </ul>
      <div className="font-semibold mb-4">Total: ₹{getTotalAmount()}</div>
      <Button onClick={clearCart} className="bg-red-500 hover:bg-red-600 text-white">
        Clear Cart
      </Button>
    </div>
  );
};

export default CartSummary;
