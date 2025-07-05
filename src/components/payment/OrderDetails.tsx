
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

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

interface OrderDetailsProps {
  order: Order;
}

export const OrderDetails = ({ order }: OrderDetailsProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Order Details
        </CardTitle>
        <CardDescription>Order ID: {order.id}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Order Date:</span>
            <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-bold text-lg">₹{order.total_amount}</span>
          </div>
          <div className="border-t pt-3">
            <h4 className="font-medium mb-2">Items:</h4>
            {order.order_items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.products.name} (×{item.quantity})</span>
                <span>₹{(item.unit_price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
