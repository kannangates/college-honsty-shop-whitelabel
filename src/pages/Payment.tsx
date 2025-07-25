import React, { useState, useEffect, useCallback } from 'react';
import { QrCode, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PayNow } from '@/components/payment/PayNow';
import { PayLater } from '@/components/payment/PayLater';

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

  const mode = searchParams.get('mode') as 'pay_now' | 'pay_later';
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  if (!orderId || !amount) {
    return <div className="p-8 text-center text-red-600">Invalid payment link or missing order information.</div>;
  }

  if (mode === 'pay_now') {
    return <PayNow orderId={orderId} amount={Number(amount)} />;
  }
  if (mode === 'pay_later') {
    return <PayLater />;
  }
  return <div className="p-8 text-center text-gray-600">Select a payment mode to continue.</div>;
};

export default Payment;
