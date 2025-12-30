
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Trash2 } from 'lucide-react';

import { ThankYouModal } from '@/components/cart/ThankYouModal';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';

interface CartItem {
  id: string;
  name: string;
  unit_price: number;
  quantity: number;
}

interface CartSummaryProps {
  items: CartItem[];
  updateQuantity: (productId: string, quantity: number) => void;
  totalPrice: number;
  checkout: (mode: 'immediate' | 'later') => Promise<{ id: string; friendly_id?: string | null } | null>;
}

export const CartSummary = ({ items, updateQuantity, totalPrice, checkout }: CartSummaryProps) => {
  const [thankYouModalOpen, setThankYouModalOpen] = useState(false);
  const [loadingPayNow, setLoadingPayNow] = useState(false);
  const [loadingPayLater, setLoadingPayLater] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'pay_now' | 'pay_later' | null>(null);
  const navigate = useNavigate();

  const navigateToPayment = (mode: 'pay_now' | 'pay_later', order: { id: string; friendly_id?: string | null }) => {
    const friendlyOrderId = order.friendly_id || order.id;
    const encodedOrderId = encodeURIComponent(friendlyOrderId);
    navigate(`/payment?mode=${mode}&orderId=${encodedOrderId}`);
  };

  const handlePayNow = async () => {
    setLoadingPayNow(true);
    try {
      const order = await checkout('immediate');
      if (order) {
        navigateToPayment('pay_now', order);
      }
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setLoadingPayNow(false);
    }
  };

  const handlePayLater = async () => {
    setLoadingPayLater(true);
    try {
      const order = await checkout('later');
      if (order) {
        navigateToPayment('pay_later', order);
      }
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setLoadingPayLater(false);
    }
  };

  const openConfirm = (mode: 'pay_now' | 'pay_later') => {
    setConfirmMode(mode);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    if (confirmMode === 'pay_now') {
      await handlePayNow();
    } else if (confirmMode === 'pay_later') {
      await handlePayLater();
    }
  };



  // Always render the cart, even when empty

  return (
    <>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Order</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            Are you sure you want to {confirmMode === 'pay_now' ? 'pay now' : 'pay later'}?
          </div>
          <DialogFooter>
            <Button onClick={handleConfirm} disabled={loadingPayNow || loadingPayLater}>
              {loadingPayNow || loadingPayLater ? (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  Processing...
                </div>
              ) : 'Confirm'}
            </Button>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={loadingPayNow || loadingPayLater}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col h-fit sticky top-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <ShoppingCart className="h-5 w-5" />
            Cart Summary ({items.length} items)
          </CardTitle>
        </CardHeader>

        {items.length === 0 ? (
          // Empty cart state
          <CardContent className="py-8">
            <div className="text-center">
              <div className="bg-white rounded-full p-6 mb-4 shadow-sm mx-auto w-fit">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 text-sm mb-6">Add products from the table to get started</p>

              {/* Quick tips section */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-900 mb-3">Quick Tips:</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">•</span>
                    Use filters to find products quickly
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">•</span>
                    Click + to add items to cart
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 font-bold">•</span>
                    Pay now or pay later options available
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        ) : (
          // Cart with items
          <>
            {/* Fixed header */}
            <div className="px-6 pb-2">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-200 bg-gray-50 rounded-lg sticky top-0 z-10">
                <div className="w-32 text-left">Product</div>
                <div className="w-16 text-center">Price</div>
                <div className="w-16 text-center">Qty</div>
                <div className="w-16 text-center">Total</div>
                <div className="w-8 text-center"></div>
              </div>
            </div>

            {/* Scrollable cart items */}
            <CardContent className="flex-1 pt-0 pb-2">
              <div className="max-h-80 overflow-y-auto pr-2">
                <div className="space-y-0">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-white border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                      {/* Product name - fixed width with truncation, left aligned */}
                      <div className="w-32 min-w-0 text-left">
                        <div className="font-medium text-sm truncate" title={item.name}>
                          {item.name}
                        </div>
                      </div>

                      {/* Unit price - fixed width */}
                      <div className="w-16 text-center text-xs text-gray-600">
                        ₹{item.unit_price.toLocaleString()}
                      </div>

                      {/* Quantity input - fixed width */}
                      <div className="w-16 flex justify-center">
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={e => updateQuantity(item.id, Number(e.target.value))}
                          className="w-12 h-7 text-center text-xs p-1"
                        />
                      </div>

                      {/* Total amount - fixed width */}
                      <div className="w-16 text-center">
                        <span className="font-semibold text-xs">₹{(item.quantity * item.unit_price).toLocaleString()}</span>
                      </div>

                      {/* Delete button - fixed width */}
                      <div className="w-8 flex justify-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, 0)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>

            {/* Footer with total and payment buttons - reduced gap */}
            <div className="border-t bg-gradient-to-br from-purple-50 to-pink-50 px-6 py-4">
              <div className="bg-white rounded-lg p-3 shadow-sm mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-purple-900">Total:</span>
                  <span className="text-xl font-bold text-purple-900">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => openConfirm('pay_now')}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  disabled={loadingPayNow || loadingPayLater}
                >
                  {loadingPayNow ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      Processing...
                    </div>
                  ) : 'Pay Now'}
                </Button>
                <Button
                  onClick={() => openConfirm('pay_later')}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  disabled={loadingPayNow || loadingPayLater}
                >
                  {loadingPayLater ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      Processing...
                    </div>
                  ) : 'Pay Later'}
                </Button>
              </div>
            </div>
          </>
        )}

        <ThankYouModal
          isOpen={thankYouModalOpen}
          onClose={() => setThankYouModalOpen(false)}
        />
      </Card>
    </>
  );

};
