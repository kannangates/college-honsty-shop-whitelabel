import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/useAuth';
import { CreditCard, LogOut } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  amount: number;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  amount,
  onPaymentSuccess
}) => {
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logout } = useAuth();

  const handlePayment = async () => {
    if (!transactionId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a transaction ID',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Update order payment status
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          transaction_id: transactionId,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      toast({
        title: 'Payment Successful!',
        description: 'Your payment has been recorded successfully.',
      });

      onPaymentSuccess();
      onClose();
      
      // Auto logout after 2 seconds
      setTimeout(() => {
        logout();
      }, 2000);

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'Failed to record payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTransactionId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            Payment Confirmation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* QR Code placeholder */}
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">QR Code for Payment</p>
                <p className="text-xs">Scan to pay</p>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="text-center">
            <div className="text-sm text-gray-600">Amount to Pay</div>
            <div className="text-3xl font-bold text-green-600">₹{amount.toFixed(2)}</div>
          </div>

          {/* Transaction ID Input */}
          <div>
            <Label htmlFor="transactionId">Transaction ID</Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter your transaction ID"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the transaction ID from your payment app
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handlePayment}
              disabled={loading || !transactionId.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processing...' : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Save & Logout
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};