import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/useAuth';

interface PayLaterProps {
  onClose?: () => void;
}

export const PayLater: React.FC<PayLaterProps> = ({ onClose }) => {
  const { logout } = useAuth();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown === 0) {
      logout();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, logout]);

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto space-y-6">
      <div className="text-2xl font-bold text-green-700">Order Created!</div>
      <div className="text-gray-600 text-center">
        You can pay for your order later from your My Orders page or by scanning the QR code at the shop.<br />
        <span className="inline-block mt-4 text-red-600 font-semibold">
          You will be logged out in {countdown} second{countdown !== 1 ? 's' : ''}.
        </span>
      </div>
      <Button variant="destructive" onClick={logout}>Logout Now</Button>
    </div>
  );
};

export default PayLater;
