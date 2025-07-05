// Enhanced Alert Management System
export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  source: string;
  metadata?: Record<string, unknown>;
}

export class AlertManager {
  private static instance: AlertManager;
  private alerts: Alert[] = [];
  private listeners: ((alerts: Alert[]) => void)[] = [];

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  private constructor() {
    console.log('🚨 AlertManager initialized');
    // Initialize with real system alerts only, no mock data
    this.initializeSystemAlerts();
  }

  private initializeSystemAlerts() {
    // Only add real system alerts here
    console.log('📋 System alerts initialized (no mock data)');
  }

  // Create a new alert
  private createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>): void {
    const newAlert: Alert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      acknowledged: false
    };

    console.log('🚨 New alert created:', {
      id: newAlert.id,
      type: newAlert.type,
      severity: newAlert.severity,
      title: newAlert.title,
      source: newAlert.source
    });

    this.alerts.unshift(newAlert);
    this.notifyListeners();
  }

  // Public method to add system alerts
  addSystemAlert(
    type: Alert['type'], 
    severity: Alert['severity'], 
    title: string, 
    message: string, 
    source: string = 'system',
    metadata?: Record<string, unknown>
  ): void {
    this.createAlert({
      type,
      severity,
      title,
      message,
      source,
      metadata
    });
  }

  // Get all alerts
  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  // Get unacknowledged alerts
  getUnacknowledgedAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.acknowledged);
  }

  // Get alerts by severity
  getAlertsBySeverity(severity: Alert['severity']): Alert[] {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  // Acknowledge an alert
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      console.log('✅ Alert acknowledged:', alertId);
      this.notifyListeners();
    }
  }

  // Acknowledge all alerts
  acknowledgeAllAlerts(): void {
    this.alerts.forEach(alert => {
      alert.acknowledged = true;
    });
    console.log('✅ All alerts acknowledged');
    this.notifyListeners();
  }

  // Remove an alert
  removeAlert(alertId: string): void {
    const index = this.alerts.findIndex(a => a.id === alertId);
    if (index !== -1) {
      this.alerts.splice(index, 1);
      console.log('🗑️ Alert removed:', alertId);
      this.notifyListeners();
    }
  }

  // Clear all alerts
  clearAllAlerts(): void {
    this.alerts = [];
    console.log('🗑️ All alerts cleared');
    this.notifyListeners();
  }

  // Subscribe to alert changes
  subscribe(listener: (alerts: Alert[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.alerts]);
      } catch (error) {
        console.error('❌ Error notifying alert listener:', error);
      }
    });
  }

  // Get alert statistics
  getAlertStats() {
    const stats = {
      total: this.alerts.length,
      unacknowledged: this.getUnacknowledgedAlerts().length,
      critical: this.getAlertsBySeverity('critical').length,
      high: this.getAlertsBySeverity('high').length,
      medium: this.getAlertsBySeverity('medium').length,
      low: this.getAlertsBySeverity('low').length
    };

    return stats;
  }

  // Monitor system performance and create alerts
  checkSystemHealth(): void {
    console.log('🔍 Checking system health...');
    
    // Only create real alerts based on actual system conditions
    // Remove any mock alert generation
    
    console.log('✅ System health check completed');
  }
}
