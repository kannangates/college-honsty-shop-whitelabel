
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Trash2 } from 'lucide-react';

import { ThankYouModal } from '@/components/cart/ThankYouModal';

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
  checkout: (mode: 'immediate' | 'later') => Promise<{ id: string } | null>;
}

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';

export const CartSummary = ({ items, updateQuantity, totalPrice, checkout }: CartSummaryProps) => {
  const [thankYouModalOpen, setThankYouModalOpen] = useState(false);
  const [loadingPayNow, setLoadingPayNow] = useState(false);
  const [loadingPayLater, setLoadingPayLater] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'pay_now' | 'pay_later' | null>(null);
  const navigate = useNavigate();

  const handlePayNow = async () => {
    setLoadingPayNow(true);
    try {
      const order = await checkout('immediate');
      if (order) {
        navigate(`/payment?mode=pay_now&orderId=${order.id}&amount=${totalPrice}`);
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
        navigate(`/payment?mode=pay_later&orderId=${order.id}&amount=${totalPrice}`);
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

  const handlePaymentSuccess = () => {
    // Payment completed successfully
  };

  if (items.length === 0) return null;

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

      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <ShoppingCart className="h-5 w-5" />
            Cart Summary ({items.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-60 overflow-y-auto space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-600">₹{item.unit_price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => updateQuantity(item.id, Number(e.target.value))}
                    className="w-16 h-8 text-center text-sm"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateQuantity(item.id, 0)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right min-w-[60px]">
                  <p className="font-semibold text-sm">₹{(item.quantity * item.unit_price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold text-purple-900">Total: ₹{totalPrice.toFixed(2)}</span>
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

          <ThankYouModal
            isOpen={thankYouModalOpen}
            onClose={() => setThankYouModalOpen(false)}
          />
        </CardContent>
      </Card>
    </>
  );

};
