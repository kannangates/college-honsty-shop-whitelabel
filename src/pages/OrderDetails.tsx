
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Calendar, DollarSign, User } from 'lucide-react';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Mock order data - in real app, fetch by orderId
  const order = {
    id: orderId || 'ORD001',
    studentName: 'Arjun Kumar',
    studentId: 'CS21001',
    items: [
      { name: 'Samosa', quantity: 2, unitPrice: 15, total: 30 },
      { name: 'Tea', quantity: 1, unitPrice: 10, total: 10 },
      { name: 'Biscuits', quantity: 1, unitPrice: 5, total: 5 }
    ],
    total: 45,
    status: 'completed',
    timestamp: '2024-01-30 14:30',
    paymentMethod: 'Honest Payment',
    transactionId: 'TXN123456789',
    studentEmail: 'arjun.kumar@college.edu',
    studentMobile: '+91 9876543210',
    orderNotes: 'Student requested extra packaging'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4 text-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/orders')}
          className="text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Orders
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order Header */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#202072] to-[#e66166] rounded-full flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{order.id}</CardTitle>
                    <CardDescription className="text-sm">{order.timestamp}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Order Items */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity} × ₹{item.unitPrice}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">₹{item.total}</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t font-bold text-lg">
                  <span>Total Amount:</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600">Payment Method</label>
                  <p className="text-sm">{order.paymentMethod}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Transaction ID</label>
                  <p className="text-sm">{order.transactionId}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Amount Paid</label>
                  <p className="text-sm font-bold">₹{order.total}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Payment Status</label>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Information */}
        <div className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Name</label>
                  <p className="text-sm">{order.studentName}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Student ID</label>
                  <p className="text-sm">{order.studentId}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Email</label>
                  <p className="text-sm">{order.studentEmail}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Mobile</label>
                  <p className="text-sm">{order.studentMobile}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Order Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{order.orderNotes}</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full bg-gradient-to-r from-[#202072] to-[#e66166] text-white text-sm">
              Print Order
            </Button>
            <Button variant="outline" className="w-full text-sm">
              Refund Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
