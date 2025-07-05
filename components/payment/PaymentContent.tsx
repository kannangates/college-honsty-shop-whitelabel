
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaymentContentProps {
  mode: 'pay_now' | 'pay_later';
  qrUrl: string;
  transactionId: string;
  setTransactionId: (id: string) => void;
  onPaymentSubmit: () => void;
  onSwitchToPayLater: () => void;
}

export const PaymentContent = ({
  mode,
  qrUrl,
  transactionId,
  setTransactionId,
  onPaymentSubmit,
  onSwitchToPayLater
}: PaymentContentProps) => {
  const navigate = useNavigate();

  if (mode === 'pay_now') {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Payment QR Code
          </CardTitle>
          <CardDescription>Scan the QR code to make payment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qrUrl ? (
            <div className="flex justify-center">
              <img 
                src={qrUrl} 
                alt="Payment QR Code" 
                className="w-64 h-64 border rounded-lg"
              />
            </div>
          ) : (
            <div className="flex justify-center p-8">
              <div className="text-center text-gray-500">
                <QrCode className="h-16 w-16 mx-auto mb-2" />
                <p>QR Code not configured</p>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="txnId">Transaction ID (Optional)</Label>
            <Input
              id="txnId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID after payment"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={onPaymentSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Payment
            </Button>
            <Button 
              onClick={onSwitchToPayLater}
              variant="outline"
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              Pay Later
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          Order Confirmed
        </CardTitle>
        <CardDescription>Thank you for your order!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-800">
            Your order has been placed successfully. You can pay later by visiting 
            "My Orders" in your account and clicking the "Pay Now" button for unpaid orders.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/my-orders')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            View My Orders
          </Button>
          <Button 
            onClick={() => navigate('/add-product')}
            variant="outline"
            className="flex-1"
          >
            Continue Shopping
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
