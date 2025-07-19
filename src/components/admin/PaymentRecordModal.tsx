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

// Define a type for the joined user object
interface JoinedUser {
  name: string;
  student_id: string;
}

export const PaymentRecordModal = ({ open, onOpenChange, onRecordAdded }: PaymentRecordModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderComboOpen, setOrderComboOpen] = useState(false);
  const [unpaidOrders, setUnpaidOrders] = useState<UnpaidOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [formData, setFormData] = useState<{
    payment_mode: Database["public"]["Enums"]["payment_mode"] | "";
    transaction_id: string;
    paid_at: string;
  }>({
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

      const formattedOrders = data.map((order: { id: string; user_id: string; total_amount: number; created_at: string; users: JoinedUser }) => ({
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
    if (!selectedOrder || !formData.payment_mode || !formData.transaction_id) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_mode: formData.payment_mode || null,
          transaction_id: formData.transaction_id,
          paid_at: new Date(formData.paid_at).toISOString()
        })
        .eq('id', selectedOrder);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payment record updated successfully',
      });

      setSelectedOrder('');
      setFormData({
        payment_mode: '',
        transaction_id: '',
        paid_at: new Date().toISOString().slice(0, 16)
      });
      
      onRecordAdded();
      onOpenChange(false);
      fetchUnpaidOrders(); // Refresh the list
    } catch (error) {
      console.error('Error updating payment record:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment record',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedOrderData = unpaidOrders.find(order => order.id === selectedOrder);

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
            <Label>Select Order</Label>
            <Popover open={orderComboOpen} onOpenChange={setOrderComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={orderComboOpen}
                  className="w-full justify-between"
                >
                  {selectedOrder
                    ? unpaidOrders.find(order => order.id === selectedOrder)?.user_name + 
                      ` (${unpaidOrders.find(order => order.id === selectedOrder)?.student_id}) - ₹${unpaidOrders.find(order => order.id === selectedOrder)?.total_amount}`
                    : "Select order..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search orders..." />
                  <CommandList>
                    <CommandEmpty>No unpaid orders found.</CommandEmpty>
                    <CommandGroup>
                      {unpaidOrders.map((order) => (
                        <CommandItem
                          key={order.id}
                          value={`${order.user_name} ${order.student_id} ${order.total_amount}`}
                          onSelect={() => {
                            setSelectedOrder(order.id);
                            setOrderComboOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedOrder === order.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{order.user_name} ({order.student_id})</span>
                            <span className="text-sm text-muted-foreground">
                              ₹{order.total_amount} • {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedOrderData && (
            <div className="p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium text-sm mb-2">Order Details</h4>
              <div className="space-y-1 text-sm">
                <div>Student: {selectedOrderData.user_name} ({selectedOrderData.student_id})</div>
                <div>Amount: ₹{selectedOrderData.total_amount}</div>
                <div>Order Date: {new Date(selectedOrderData.created_at).toLocaleString()}</div>
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="payment_mode">Payment Method</Label>
            <Select value={formData.payment_mode} onValueChange={(value) => setFormData({...formData, payment_mode: value as Database["public"]["Enums"]["payment_mode"]})}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qr_manual">QR/Manual</SelectItem>
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