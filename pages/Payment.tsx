
import React, { useState, useEffect } from 'react';
import { QrCode, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OrderDetails } from '@/components/payment/OrderDetails';
import { PaymentContent } from '@/components/payment/PaymentContent';

interface Order {
  id: string;
  total_amount: number;
  created_at: string;
  order_items: Array<{
    quantity: number;
    unit_price: number;
    products: { name: string };
  }>;
}

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const mode = searchParams.get('mode') as 'pay_now' | 'pay_later';
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactionId, setTransactionId] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
    if (mode === 'pay_now') {
      fetchQRUrl();
    }
  }, [orderId, mode]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            quantity,
            unit_price,
            products(name)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch order details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQRUrl = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('payment_qr_url')
        .single();

      if (error) throw error;
      if (data?.payment_qr_url) {
        setQrUrl(data.payment_qr_url);
      }
    } catch (error) {
      console.error('Error fetching QR URL:', error);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!orderId) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_mode: 'qr_manual',
          transaction_id: transactionId || null,
          paid_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Payment Successful',
        description: 'Your payment has been recorded successfully',
      });

      navigate('/my-orders');
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to record payment',
        variant: 'destructive',
      });
    }
  };

  const switchToPayLater = () => {
    navigate(`/payment?mode=pay_later&orderId=${orderId}&amount=${amount}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#202072] to-[#e66166] text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/add-product')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {mode === 'pay_now' ? <QrCode className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
            {mode === 'pay_now' ? 'Pay Now' : 'Pay Later'}
          </h1>
        </div>
        <p className="text-purple-100">
          {mode === 'pay_now' 
            ? 'Complete your payment using the QR code below' 
            : 'Thank you for your order! You can pay later from My Orders'
          }
        </p>
      </div>

      {order && <OrderDetails order={order} />}

      <PaymentContent
        mode={mode}
        qrUrl={qrUrl}
        transactionId={transactionId}
        setTransactionId={setTransactionId}
        onPaymentSubmit={handlePaymentSubmit}
        onSwitchToPayLater={switchToPayLater}
      />
    </div>
  );
};

export default Payment;
