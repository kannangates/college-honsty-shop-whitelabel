
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle, X } from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface AlertDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
}

const AlertDetailsModal = ({ isOpen, onClose, alerts }: AlertDetailsModalProps) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            System Alerts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getAlertIcon(alert.type)}
                  <h4 className="font-medium">{alert.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.type}
                  </Badge>
                  {!alert.acknowledged && (
                    <Badge variant="outline" className="text-orange-600">
                      Unacknowledged
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600">{alert.message}</p>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {alert.timestamp}
              </div>
            </div>
          ))}
          
          {alerts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <p>No active alerts</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlertDetailsModal;
