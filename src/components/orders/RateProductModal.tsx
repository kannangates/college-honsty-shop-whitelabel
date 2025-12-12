import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { YellowRating } from '@/components/ui/rating';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Star, Package } from 'lucide-react';

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

interface RateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: OrderItem[];
  orderNumber: string;
  onRatingSubmitted?: () => void;
}

interface RatingData {
  [itemId: string]: {
    rating: number;
    comment: string;
  };
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(value);

export const RateProductModal: React.FC<RateProductModalProps> = ({
  isOpen,
  onClose,
  orderItems,
  orderNumber,
  onRatingSubmitted,
}) => {
  const [ratings, setRatings] = useState<RatingData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRatingChange = (itemId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        rating,
      }
    }));
  };

  const handleCommentChange = (itemId: string, comment: string) => {
    setRatings(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        comment,
      }
    }));
  };

  const handleSubmit = async () => {
    // Get items that need new ratings (not already rated)
    const unratedItems = orderItems.filter(item => !item.rated_at);

    // Validate that all unrated items have ratings
    const itemsWithNewRatings = Object.keys(ratings).filter(
      itemId => ratings[itemId]?.rating > 0
    );

    if (unratedItems.length > 0 && itemsWithNewRatings.length === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please rate at least one product before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update each order item with rating and review
      const updates = itemsWithNewRatings.map(itemId => {
        const ratingData = ratings[itemId];
        return supabase
          .from('order_items')
          .update({
            rating: ratingData.rating,
            review_comment: ratingData.comment || null,
            rated_at: new Date().toISOString(),
          } as Record<string, unknown>)
          .eq('id', itemId);
      });

      const results = await Promise.all(updates);

      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(errors[0].error?.message || 'Failed to submit ratings');
      }

      toast({
        title: 'Ratings Submitted',
        description: `Thank you for rating ${itemsWithNewRatings.length} product${itemsWithNewRatings.length > 1 ? 's' : ''}!`,
      });

      onRatingSubmitted?.();
      onClose();
      setRatings({});
    } catch (error) {
      console.error('Error submitting ratings:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit ratings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRatings({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Star className="h-6 w-6 text-yellow-500" />
            Rate Your Products
          </DialogTitle>
          <DialogDescription>
            Order #{orderNumber} - Share your experience with these products
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {orderItems.map((item) => {
            const productName = item.products?.name || 'Unknown Product';
            const currentRating = ratings[item.id]?.rating || 0;
            const currentComment = ratings[item.id]?.comment || '';
            const isAlreadyRated = !!item.rated_at;

            return (
              <div
                key={item.id}
                className="border rounded-lg p-4 space-y-4 bg-gray-50"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-indigo-400" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">
                      {productName}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: {formatCurrency(item.unit_price)}</p>
                      {isAlreadyRated && (
                        <div className="flex items-center gap-2 text-green-600">
                          <Star className="w-4 h-4 fill-current" />
                          <span>Already rated {item.rating}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {!isAlreadyRated && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating
                      </label>
                      <YellowRating
                        value={currentRating}
                        onValueChange={(rating) => handleRatingChange(item.id, rating)}
                        size={28}
                        showValue
                        className="justify-start"
                      />
                      {currentRating > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {currentRating === 1 && "Poor"}
                          {currentRating === 2 && "Fair"}
                          {currentRating === 3 && "Good"}
                          {currentRating === 4 && "Very Good"}
                          {currentRating === 5 && "Excellent"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review (Optional)
                      </label>
                      <Textarea
                        placeholder="Share your thoughts about this product..."
                        value={currentComment}
                        onChange={(e) => handleCommentChange(item.id, e.target.value)}
                        className="resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {isAlreadyRated && (
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-green-600 fill-current" />
                      <span className="text-sm font-medium text-green-700">Your Rating</span>
                    </div>
                    <YellowRating
                      value={item.rating || 0}
                      readOnly
                      size={20}
                      showValue
                      className="justify-start mb-3"
                    />
                    {item.review_comment && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Your Review:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{item.review_comment}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Rated on {new Date(item.rated_at!).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {orderItems.every(item => item.rated_at) ? 'Close' : 'Cancel'}
          </Button>
          {!orderItems.every(item => item.rated_at) && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(ratings).length === 0}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" text="Submitting..." />
              ) : (
                'Submit Ratings'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};