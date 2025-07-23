import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/features/gamification/components/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  payment_status: string;
  payment_mode: string;
  transaction_id?: string;
  user: {
    name: string;
    student_id: string;
    department: string;
  };
  order_items: Array<{
    quantity: number;
    unit_price: number;
    total_price: number;
    product: {
      name: string;
    };
  }>;
}

interface EditOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (orderId: string, newStatus: string, transactionId?: string) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [status, setStatus] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (order) {
      setStatus(order.payment_status);
      setTransactionId(order.transaction_id || '');
    }
  }, [order]);

  const handleSave = async () => {
    if (!order) return;
    
    setLoading(true);
    try {
      await onUpdate(order.id, status, transactionId);
      toast({
        title: 'Success',
        description: 'Order updated successfully',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (order) {
      setStatus(order.payment_status);
      setTransactionId(order.transaction_id || '');
    }
    onClose();
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Order #{order.id.slice(0, 8)}</DialogTitle>
          <DialogDescription>
            Update order status and transaction details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Details */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Student:</span>
              <span>{order.user.name} ({order.user.student_id})</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Department:</span>
              <span>{order.user.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Amount:</span>
              <span className="font-bold">₹{order.total_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <Label>Order Items</Label>
            <div className="mt-2 space-y-2">
              {order.order_items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{item.product.name}</span>
                  <div className="text-right">
                    <div>{item.quantity} × ₹{item.unit_price}</div>
                    <div className="font-bold">₹{item.total_price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <Label htmlFor="status">Payment Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction ID */}
          <div>
            <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
            <Input
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID"
              className="mt-1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};