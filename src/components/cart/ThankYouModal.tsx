import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({
  isOpen,
  onClose
}) => {
  const { logout } = useAuth();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
        logout();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, logout]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="space-y-6 py-6">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600">
              Your order has been placed successfully. You will be logged out automatically.
            </p>
          </div>

          <div className="text-sm text-gray-500">
            Logging out in 3 seconds...
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};