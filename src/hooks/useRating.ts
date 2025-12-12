import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  rating?: number;
  review_comment?: string;
  rated_at?: string;
  products?: {
    id: string;
    name: string;
    unit_price: number;
  };
}

interface Order {
  id: string;
  friendly_id?: string;
  payment_status: string;
  order_items?: OrderItem[];
}

export const useRating = () => {
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>('');
  const { toast } = useToast();

  const initiateRating = (order: Order) => {
    if (order.payment_status !== 'paid') {
      toast({
        title: 'Cannot Rate',
        description: 'You can only rate products from paid orders.',
        variant: 'destructive',
      });
      return;
    }

    if (!order.order_items || order.order_items.length === 0) {
      toast({
        title: 'No Products to Rate',
        description: 'This order has no items to rate.',
        variant: 'destructive',
      });
      return;
    }

    // Set the order items and number for the modal
    setSelectedOrderItems(order.order_items);
    setSelectedOrderNumber(order.friendly_id || order.id.slice(0, 8));
    setIsRatingModalOpen(true);
  };

  const closeRatingModal = () => {
    setIsRatingModalOpen(false);
    setSelectedOrderItems([]);
    setSelectedOrderNumber('');
  };

  const handleRatingSubmitted = () => {
    // This will be called when ratings are successfully submitted
    // The parent component can use this to refresh the orders list
  };

  return {
    isRatingModalOpen,
    selectedOrderItems,
    selectedOrderNumber,
    initiateRating,
    closeRatingModal,
    handleRatingSubmitted,
  };
};