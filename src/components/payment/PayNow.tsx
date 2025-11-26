import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/useAuth';
import { LogOut, Loader2 } from 'lucide-react';

interface PayNowProps {
  orderId: string;
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PayNow: React.FC<PayNowProps> = ({ orderId, amount, onSuccess, onCancel }) => {
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logout } = useAuth();

  const handlePaymentAndLogout = async () => {
    if (!transactionId.trim()) {
      toast({ title: 'Error', description: 'Please enter a transaction ID', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const paidAt = new Date().toISOString();

      // Update order status - orders table is the single source of truth
      const { error: orderError } = await supabase.from('orders').update({
        payment_status: 'paid',
        paid_at: paidAt,
        transaction_id: transactionId,
        payment_mode: 'qr_manual'
      }).eq('id', orderId);
      if (orderError) throw orderError;

      toast({
        title: 'Payment Successful',
        description: 'Your payment has been recorded. You will be logged out now.'
      });

      if (onSuccess) {
        onSuccess();
      }

      // Auto logout after 2 seconds
      setTimeout(() => {
        logout();
      }, 2000);

    } catch (err) {
      toast({ title: 'Payment Failed', description: (err as Error).message, variant: 'destructive' });
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
            {/* Left Column - QR Code and Amount */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center p-8">
              <div className="w-full max-w-md mx-auto">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                  <img
                    src="/static-qr-code.png"
                    alt="QR Code"
                    className="w-full max-w-xs mx-auto object-contain"
                    style={{ aspectRatio: '1/1' }}
                  />
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1 font-medium">Amount to Pay</div>
                  <div className="text-5xl font-bold text-green-600">₹{amount.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Form */}
            <div className="flex flex-col p-12">
              <div className="flex-grow flex flex-col justify-center">
                <div className="max-w-md mx-auto w-full">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Payment</h2>
                    <p className="text-gray-600">
                      Please complete your payment using the QR code and enter the transaction details below.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="transactionId" className="text-gray-700 block mb-2">Transaction ID</Label>
                      <Input
                        id="transactionId"
                        value={transactionId}
                        onChange={e => setTransactionId(e.target.value)}
                        placeholder="Enter your transaction ID"
                        className="h-12 text-base px-4"
                      />
                      <p className="text-sm text-gray-500 mt-2 text-center">Enter the transaction ID from your payment app</p>
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={handlePaymentAndLogout}
                        disabled={loading}
                        size="lg"
                        className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-medium flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <LogOut className="h-4 w-4" />
                            Submit Payment & Logout
                          </>
                        )}
                      </Button>

                      {onCancel && (
                        <div className="pt-2">
                          <Button
                            variant="ghost"
                            onClick={onCancel}
                            disabled={loading}
                            className="w-full text-gray-600 hover:bg-gray-50"
                          >
                            Cancel Payment
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayNow;
