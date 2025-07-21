import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';

interface PaymentRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordAdded: () => void;
}

interface UnpaidOrder {
  id: string;
  user_id: string;
  total_amount: number;
  created_at: string;
  user_name: string;
  student_id: string;
}

// Type for the users join result
interface OrderWithUser {
  id: string;
  user_id: string;
  total_amount: number;
  created_at: string;
  users: {
    name: string;
    student_id: string;
  };
}

// Payment mode enum type
type PaymentMode = Database['public']['Enums']['payment_mode'];

export const PaymentRecordModal = ({ open, onOpenChange, onRecordAdded }: PaymentRecordModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderComboOpen, setOrderComboOpen] = useState(false);
  const [unpaidOrders, setUnpaidOrders] = useState<UnpaidOrder[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Option[]>([]);
  const [formData, setFormData] = useState({
    payment_mode: '',
    transaction_id: '',
    paid_at: new Date().toISOString().slice(0, 16)
  });

  const fetchUnpaidOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          total_amount,
          created_at,
          users!inner(name, student_id)
        `)
        .eq('payment_status', 'unpaid')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders = data.map((order: OrderWithUser) => ({
        id: order.id,
        user_id: order.user_id,
        total_amount: order.total_amount,
        created_at: order.created_at,
        user_name: order.users.name,
        student_id: order.users.student_id
      }));

      setUnpaidOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching unpaid orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch unpaid orders',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (open) {
      fetchUnpaidOrders();
    }
  }, [open, fetchUnpaidOrders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrders.length || !formData.payment_mode || !formData.transaction_id) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Update multiple orders
      const orderIds = selectedOrders.map(order => order.value);
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_mode: formData.payment_mode as PaymentMode,
          transaction_id: formData.transaction_id,
          paid_at: new Date(formData.paid_at).toISOString()
        })
        .in('id', orderIds);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Payment records updated successfully for ${selectedOrders.length} orders`,
      });

      setSelectedOrders([]);
      setFormData({
        payment_mode: '',
        transaction_id: '',
        paid_at: new Date().toISOString().slice(0, 16)
      });
      
      onRecordAdded();
      onOpenChange(false);
      fetchUnpaidOrders(); // Refresh the list
    } catch (error) {
      console.error('Error updating payment records:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const orderOptions: Option[] = unpaidOrders.map(order => ({
    label: `${order.user_name} (${order.student_id}) - ₹${order.total_amount}`,
    value: order.id
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Record Payment Transaction
          </DialogTitle>
          <DialogDescription>
            Mark an unpaid order as paid by recording the payment transaction details.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Select Orders (Multiple Selection)</Label>
            <MultipleSelector
              value={selectedOrders}
              onValueChange={setSelectedOrders}
              defaultOptions={orderOptions}
              placeholder="Select orders to mark as paid..."
              emptyIndicator={() => (
                <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                  No unpaid orders found.
                </p>
              )}
            />
          </div>

          {selectedOrders.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium text-sm mb-2">Selected Orders ({selectedOrders.length})</h4>
              <div className="space-y-1 text-sm">
                {selectedOrders.slice(0, 3).map((order) => {
                  const orderData = unpaidOrders.find(o => o.id === order.value);
                  return orderData ? (
                    <div key={order.value}>
                      {orderData.user_name} ({orderData.student_id}) - ₹{orderData.total_amount}
                    </div>
                  ) : null;
                })}
                {selectedOrders.length > 3 && (
                  <div className="text-muted-foreground">
                    +{selectedOrders.length - 3} more orders selected
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="payment_mode">Payment Method</Label>
            <Select value={formData.payment_mode} onValueChange={(value) => setFormData({...formData, payment_mode: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qr_manual">QR Manual</SelectItem>
                <SelectItem value="razorpay">Razorpay</SelectItem>
                <SelectItem value="pay_later">Pay Later</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="transaction_id">Transaction ID / Reference</Label>
            <Input
              id="transaction_id"
              value={formData.transaction_id}
              onChange={(e) => setFormData({...formData, transaction_id: e.target.value})}
              placeholder="Enter transaction ID or reference number"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="paid_at">Payment Date & Time</Label>
            <Input
              id="paid_at"
              type="datetime-local"
              value={formData.paid_at}
              onChange={(e) => setFormData({...formData, paid_at: e.target.value})}
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};