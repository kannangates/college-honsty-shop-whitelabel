import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  ShoppingCart,
  CreditCard,
  Clock,
  Package,
  Trash2
} from 'lucide-react';
import { formatIndianCurrency } from '@/utils/orderUtils';

interface ReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: Array<{
    id: string;
    name?: string;
    quantity: number;
    unit_price: number;
    total_price?: number;
    products?: {
      name: string;
      unit_price: number;
    };
  }>;
  orderNumber?: string;
}

export const ReorderModal: React.FC<ReorderModalProps> = ({
  isOpen,
  onClose,
  orderItems,
  orderNumber
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clearCart, addItem, checkout } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'immediate' | 'later' | null>(null);
  const [currentItems, setCurrentItems] = useState(orderItems);
  const [validatingProducts, setValidatingProducts] = useState(false);

  // Update current items when orderItems prop changes
  useEffect(() => {
    setCurrentItems(orderItems);
  }, [orderItems]);

  // Check product availability when modal opens
  useEffect(() => {
    if (isOpen && orderItems.length > 0) {
      checkProductAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, orderItems]);

  const checkProductAvailability = async () => {
    setValidatingProducts(true);
    try {
      const { validItems, invalidItems } = await validateProducts(orderItems);

      if (invalidItems.length > 0) {
        // Remove unavailable products from the current items list
        setCurrentItems(validItems);

        const invalidNames = invalidItems.map(item => item.products?.name || item.name || 'Unknown').join(', ');

        if (validItems.length === 0) {
          toast({
            title: 'All Products Unavailable',
            description: 'All items from your previous order are no longer available. Please browse our current products.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: `${invalidItems.length} Product${invalidItems.length > 1 ? 's' : ''} Removed`,
            description: `The following unavailable items have been removed from your reorder: ${invalidNames}`,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error checking product availability:', error);
      toast({
        title: 'Error Checking Products',
        description: 'Unable to verify product availability. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setValidatingProducts(false);
    }
  };

  // Calculate total from current items
  const totalAmount = currentItems.reduce((sum, item) => {
    const price = item.products?.unit_price || item.unit_price;
    return sum + (price * item.quantity);
  }, 0);

  const totalItems = currentItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = currentItems.filter(item => item.id !== itemId);
    setCurrentItems(updatedItems);

    toast({
      title: 'Item Removed',
      description: 'Item has been removed from your reorder list',
    });
  };

  // Validate that products still exist in the database
  const validateProducts = async (items: typeof currentItems) => {
    const productIds = items.map(item => item.id);

    const { data: existingProducts, error } = await supabase
      .from('products')
      .select('id, name, unit_price, shelf_stock, is_archived')
      .in('id', productIds)
      .eq('is_archived', false);

    if (error) {
      throw new Error(`Failed to validate products: ${error.message}`);
    }

    const existingProductIds = new Set(existingProducts?.map(p => p.id) || []);
    const validItems = items.filter(item => existingProductIds.has(item.id));
    const invalidItems = items.filter(item => !existingProductIds.has(item.id));

    return {
      validItems,
      invalidItems,
      existingProducts: existingProducts || []
    };
  };

  const handleReorder = async (mode: 'immediate' | 'later') => {
    if (currentItems.length === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please select at least one item to reorder.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setPaymentMode(mode);

    try {
      // Validate products exist before proceeding
      const { validItems, invalidItems, existingProducts } = await validateProducts(currentItems);

      if (invalidItems.length > 0) {
        // Remove invalid items from current selection
        setCurrentItems(validItems);

        const invalidNames = invalidItems.map(item => item.products?.name || item.name || 'Unknown').join(', ');

        if (validItems.length === 0) {
          toast({
            title: 'Products No Longer Available',
            description: 'All selected products are no longer available. Please select different items.',
            variant: 'destructive',
          });
          setLoading(false);
          setPaymentMode(null);
          return;
        } else {
          toast({
            title: 'Some Products Unavailable',
            description: `The following items are no longer available and have been removed: ${invalidNames}`,
            variant: 'destructive',
          });
        }
      }

      if (validItems.length === 0) {
        setLoading(false);
        setPaymentMode(null);
        return;
      }

      // Clear existing cart
      clearCart();

      // Add only valid items to cart using current product data
      for (const item of validItems) {
        const existingProduct = existingProducts.find(p => p.id === item.id);

        if (existingProduct) {
          const product = {
            id: item.id,
            name: existingProduct.name,
            unit_price: existingProduct.unit_price,
          };

          // Add the item with the original quantity
          for (let i = 0; i < item.quantity; i++) {
            addItem(product);
          }
        }
      }

      // Wait a bit for cart to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Checkout with selected mode
      const order = await checkout(mode);

      if (order) {
        toast({
          title: 'Reorder Successful!',
          description: `Order #${order.friendly_id || order.id.slice(0, 8)} has been created.`,
        });

        if (mode === 'immediate') {
          // Navigate to payment page
          const encodedOrderId = encodeURIComponent(order.friendly_id || order.id);
          navigate(`/payment?mode=pay_now&orderId=${encodedOrderId}`);
        } else {
          // Navigate to orders page
          navigate('/my-orders');
        }

        onClose();
      }
    } catch (error) {
      console.error('Reorder error:', error);
      toast({
        title: 'Reorder Failed',
        description: 'There was an error processing your reorder. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setPaymentMode(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Reorder {orderNumber ? `#${orderNumber}` : 'Items'}
          </DialogTitle>
          <DialogDescription>
            Review your previous order and choose how you'd like to pay.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Items Review */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Items to Reorder ({totalItems} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {validatingProducts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Checking Product Availability</h3>
                  <p className="text-gray-500">Verifying that items are still available...</p>
                </div>
              ) : currentItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items to reorder</h3>
                  <p className="text-gray-500">All items have been removed</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {currentItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        {currentItems.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{item.products?.name || item.name}</h4>
                          <p className="text-sm text-gray-600">
                            {formatIndianCurrency(item.products?.unit_price || item.unit_price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatIndianCurrency((item.products?.unit_price || item.unit_price) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatIndianCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Choose Payment Option</h3>

            <div className="flex gap-2">
              <Button
                onClick={() => handleReorder('immediate')}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                disabled={loading || currentItems.length === 0 || validatingProducts}
              >
                {loading && paymentMode === 'immediate' ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Pay Now
                  </div>
                )}
              </Button>
              <Button
                onClick={() => handleReorder('later')}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                disabled={loading || currentItems.length === 0 || validatingProducts}
              >
                {loading && paymentMode === 'later' ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pay Later
                  </div>
                )}
              </Button>
            </div>
          </div>


        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};