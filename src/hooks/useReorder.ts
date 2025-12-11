import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  name?: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  products?: {
    name: string;
    unit_price: number;
  };
}

interface Order {
  id: string;
  friendly_id?: string;
  order_items?: OrderItem[];
}

export const useReorder = () => {
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>('');
  const { toast } = useToast();

  const initiateReorder = (order: Order) => {
    if (!order.order_items || order.order_items.length === 0) {
      toast({
        title: 'Cannot Reorder',
        description: 'This order has no items to reorder.',
        variant: 'destructive',
      });
      return;
    }

    // Set the order items and number for the modal
    setSelectedOrderItems(order.order_items);
    setSelectedOrderNumber(order.friendly_id || order.id.slice(0, 8));
    setIsReorderModalOpen(true);

    toast({
      title: 'Reorder Initiated',
      description: 'Review your items and proceed to checkout.',
    });
  };

  const closeReorderModal = () => {
    setIsReorderModalOpen(false);
    setSelectedOrderItems([]);
    setSelectedOrderNumber('');
  };

  return {
    isReorderModalOpen,
    selectedOrderItems,
    selectedOrderNumber,
    initiateReorder,
    closeReorderModal,
  };
};