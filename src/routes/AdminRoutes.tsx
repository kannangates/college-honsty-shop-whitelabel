import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminProtectedRoute } from '@/components/layout/AdminProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import AdminPanel from '@/pages/AdminPanel';
import AdminStudentManagement from '@/pages/admin/AdminStudentManagement';
import AdminOrderManagement from '@/pages/admin/AdminOrderManagement';
import AdminInventory from '@/pages/admin/AdminInventory';
import AdminIntegrations from '@/pages/admin/AdminIntegrations';
import AdminN8nPage from '@/pages/admin/n8n/AdminN8nPage';
import AdminPointsBadges from '@/pages/admin/AdminPointsBadges';
import AdminStockAccounting from '@/pages/admin/AdminStockAccounting';
import AdminStockAccountingHistory from '@/pages/admin/AdminStockAccountingHistory';
import AdminPaymentReports from '@/pages/admin/AdminPaymentReports';
import AdminDeveloper from '@/pages/admin/AdminDeveloper';
import WhitelabelConfig from '@/pages/admin/WhitelabelConfig';
import EdgeFunctionsPage from '@/pages/admin/EdgeFunctions';
import AdminAuditLogs from '@/pages/admin/AdminAuditLogs';
import ISOCompliance from '@/pages/ISOCompliance';

const AdminLayoutRoute = ({ children }: { children: React.ReactNode }) => (
  <AdminProtectedRoute>
    <Layout>
      {children}
    </Layout>
  </AdminProtectedRoute>
);

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayoutRoute><AdminPanel /></AdminLayoutRoute>} />
      <Route path="/student-management" element={<AdminLayoutRoute><AdminStudentManagement /></AdminLayoutRoute>} />
      <Route path="/order-management" element={<AdminLayoutRoute><AdminOrderManagement /></AdminLayoutRoute>} />
      <Route path="/inventory" element={<AdminLayoutRoute><AdminInventory /></AdminLayoutRoute>} />
      <Route path="/integrations" element={<AdminLayoutRoute><AdminIntegrations /></AdminLayoutRoute>} />
      <Route path="/n8n" element={<AdminLayoutRoute><AdminN8nPage /></AdminLayoutRoute>} />
      <Route path="/points-badges" element={<AdminLayoutRoute><AdminPointsBadges /></AdminLayoutRoute>} />
      <Route path="/stock-accounting" element={<AdminLayoutRoute><AdminStockAccounting /></AdminLayoutRoute>} />
      <Route path="/stock-accounting-history" element={<AdminLayoutRoute><AdminStockAccountingHistory /></AdminLayoutRoute>} />
      <Route path="/payment-reports" element={<AdminLayoutRoute><AdminPaymentReports /></AdminLayoutRoute>} />
      <Route path="/dev-tools" element={<AdminLayoutRoute><AdminDeveloper /></AdminLayoutRoute>} />
      <Route path="/whitelabel-config" element={<AdminLayoutRoute><WhitelabelConfig /></AdminLayoutRoute>} />
      <Route path="/edge-functions" element={<AdminLayoutRoute><EdgeFunctionsPage /></AdminLayoutRoute>} />
      <Route path="/audit-logs" element={<AdminLayoutRoute><AdminAuditLogs /></AdminLayoutRoute>} />
      <Route path="/iso-compliance" element={<AdminLayoutRoute><ISOCompliance /></AdminLayoutRoute>} />
    </Routes>
  );
};
