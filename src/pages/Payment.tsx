import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { PayNow } from '@/components/payment/PayNow';
import { PayLater } from '@/components/payment/PayLater';

interface Order {
  id: string;
  total_amount: number;
  friendly_id?: string | null;
}

const FRIENDLY_ID_PATTERN = /^ORD\d+$/i;
const selectFields = 'id,total_amount,friendly_id';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  const mode = searchParams.get('mode') as 'pay_now' | 'pay_later';
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      if (!orderId) {
        setOrderError('Invalid payment link or missing order information.');
        setLoadingOrder(false);
        return;
      }

      setLoadingOrder(true);
      const trimmedOrderId = orderId.trim();
      const isFriendlyId = FRIENDLY_ID_PATTERN.test(trimmedOrderId);
      let data: Order | null = null;
      let error: PostgrestError | null = null;

      if (isFriendlyId) {
        const friendlyResult = await supabase
          .from('orders')
          .select(selectFields)
          .eq('friendly_id', trimmedOrderId.toUpperCase())
          .maybeSingle<Order>();

        if (friendlyResult.data) {
          data = friendlyResult.data;
        } else if (friendlyResult.error && friendlyResult.error.code !== 'PGRST116') {
          error = friendlyResult.error;
        }
      }

      if (!data && !error) {
        const idResult = await supabase
          .from('orders')
          .select(selectFields)
          .eq('id', trimmedOrderId)
          .maybeSingle<Order>();

        if (idResult.data) {
          data = idResult.data;
        } else if (idResult.error && idResult.error.code !== 'PGRST116') {
          error = idResult.error;
        }
      }

      if (!isMounted) {
        return;
      }

      if (error || !data) {
        setOrderError('We could not find an order matching this link.');
        setOrder(null);
      } else {
        setOrderError(null);
        setOrder(data);
      }
      setLoadingOrder(false);
    };

    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (!orderId) {
    return <div className="p-8 text-center text-red-600">Invalid payment link or missing order information.</div>;
  }

  if (loadingOrder) {
    return <div className="p-8 text-center text-gray-600">Loading your order details...</div>;
  }

  if (orderError || !order) {
    return <div className="p-8 text-center text-red-600">{orderError || 'Unable to load order details.'}</div>;
  }

  if (mode === 'pay_now') {
    return <PayNow orderId={order.id} amount={Number(order.total_amount)} />;
  }
  if (mode === 'pay_later') {
    return <PayLater />;
  }
  return <div className="p-8 text-center text-gray-600">Select a payment mode to continue.</div>;
};

export default Payment;
