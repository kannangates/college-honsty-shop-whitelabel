
import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import AdminPanel from '@/pages/AdminPanel';
import AdminStudentManagement from '@/pages/admin/AdminStudentManagement';
import AdminOrderManagement from '@/pages/admin/AdminOrderManagement';
import AdminInventory from '@/pages/admin/AdminInventory';
import AdminIntegrations from '@/pages/admin/AdminIntegrations';
import AdminPointsBadges from '@/pages/admin/AdminPointsBadges';
import AdminStockAccounting from '@/pages/admin/AdminStockAccounting';
import AdminPaymentReports from '@/pages/admin/AdminPaymentReports';
import AdminDeveloper from '@/pages/admin/AdminDeveloper';
import WhitelabelConfig from '@/pages/admin/WhitelabelConfig';


const ProtectedLayoutRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <Layout>
      {children}
    </Layout>
  </ProtectedRoute>
);

export const AdminRoutes = () => {
  return (
    <>
      <Route path="/admin" element={<ProtectedLayoutRoute><AdminPanel /></ProtectedLayoutRoute>} />
      <Route path="/admin/student-management" element={<ProtectedLayoutRoute><AdminStudentManagement /></ProtectedLayoutRoute>} />
      <Route path="/admin/order-management" element={<ProtectedLayoutRoute><AdminOrderManagement /></ProtectedLayoutRoute>} />
      <Route path="/admin/inventory" element={<ProtectedLayoutRoute><AdminInventory /></ProtectedLayoutRoute>} />
      <Route path="/admin/integrations" element={<ProtectedLayoutRoute><AdminIntegrations /></ProtectedLayoutRoute>} />
      <Route path="/admin/points-badges" element={<ProtectedLayoutRoute><AdminPointsBadges /></ProtectedLayoutRoute>} />
      <Route path="/admin/stock-accounting" element={<ProtectedLayoutRoute><AdminStockAccounting /></ProtectedLayoutRoute>} />
      <Route path="/admin/payment-reports" element={<ProtectedLayoutRoute><AdminPaymentReports /></ProtectedLayoutRoute>} />
      <Route path="/admin/dev-tools" element={<ProtectedLayoutRoute><AdminDeveloper /></ProtectedLayoutRoute>} />
      <Route path="/admin/whitelabel-config" element={<ProtectedLayoutRoute><WhitelabelConfig /></ProtectedLayoutRoute>} />
    </>
  );
};
