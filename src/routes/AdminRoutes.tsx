
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import AdminPanel from '@/pages/AdminPanel';
import AdminStudentManagement from '@/pages/admin/AdminStudentManagement';
import AdminOrderManagement from '@/pages/admin/AdminOrderManagement';
import AdminInventory from '@/pages/admin/AdminInventory';
import AdminIntegrations from '@/pages/admin/AdminIntegrations';
import AdminN8nPage from '@/pages/admin/n8n/AdminN8nPage';
import AdminPointsBadges from '@/pages/admin/AdminPointsBadges';
import AdminStockAccounting from '@/pages/admin/AdminStockAccounting';
import AdminPaymentReports from '@/pages/admin/AdminPaymentReports';
import AdminDeveloper from '@/pages/admin/AdminDeveloper';
import WhitelabelConfig from '@/pages/admin/WhitelabelConfig';
import EdgeFunctionsPage from '@/pages/admin/EdgeFunctions';

const ProtectedLayoutRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <Layout>
      {children}
    </Layout>
  </ProtectedRoute>
);

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedLayoutRoute><AdminPanel /></ProtectedLayoutRoute>} />
      <Route path="/student-management" element={<ProtectedLayoutRoute><AdminStudentManagement /></ProtectedLayoutRoute>} />
      <Route path="/order-management" element={<ProtectedLayoutRoute><AdminOrderManagement /></ProtectedLayoutRoute>} />
      <Route path="/inventory" element={<ProtectedLayoutRoute><AdminInventory /></ProtectedLayoutRoute>} />
      <Route path="/integrations" element={<ProtectedLayoutRoute><AdminIntegrations /></ProtectedLayoutRoute>} />
      <Route path="/n8n" element={<ProtectedLayoutRoute><AdminN8nPage /></ProtectedLayoutRoute>} />
      <Route path="/points-badges" element={<ProtectedLayoutRoute><AdminPointsBadges /></ProtectedLayoutRoute>} />
      <Route path="/stock-accounting" element={<ProtectedLayoutRoute><AdminStockAccounting /></ProtectedLayoutRoute>} />
      <Route path="/payment-reports" element={<ProtectedLayoutRoute><AdminPaymentReports /></ProtectedLayoutRoute>} />
      <Route path="/dev-tools" element={<ProtectedLayoutRoute><AdminDeveloper /></ProtectedLayoutRoute>} />
      <Route path="/whitelabel-config" element={<ProtectedLayoutRoute><WhitelabelConfig /></ProtectedLayoutRoute>} />
      <Route path="/edge-functions" element={<ProtectedLayoutRoute><EdgeFunctionsPage /></ProtectedLayoutRoute>} />
    </Routes>
  );
};
