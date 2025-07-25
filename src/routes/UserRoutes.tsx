
import React from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import MyOrders from '@/pages/MyOrders';
import OrderDetails from '@/pages/OrderDetails';
import Payment from '@/pages/Payment';
import Settings from '@/pages/Settings';
import Notifications from '@/pages/Notifications';
import BadgeGallery from '@/pages/BadgeGallery';
import AboutSystem from '@/pages/AboutSystem';
import AddProduct from '@/pages/AddProduct';

const ProtectedLayoutRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <Layout>
      {children}
    </Layout>
  </ProtectedRoute>
);

export const UserRoutes = () => {
  return (
    <>
      <Route path="/dashboard" element={<ProtectedLayoutRoute><Dashboard /></ProtectedLayoutRoute>} />
      <Route path="/my-orders" element={<ProtectedLayoutRoute><MyOrders /></ProtectedLayoutRoute>} />
      <Route path="/add-product" element={<ProtectedLayoutRoute><AddProduct /></ProtectedLayoutRoute>} />
      <Route path="/order/:id" element={<ProtectedLayoutRoute><OrderDetails /></ProtectedLayoutRoute>} />
      <Route path="/payment" element={<ProtectedLayoutRoute><Payment /></ProtectedLayoutRoute>} />
      <Route path="/settings" element={<ProtectedLayoutRoute><Settings /></ProtectedLayoutRoute>} />
      <Route path="/notifications" element={<ProtectedLayoutRoute><Notifications /></ProtectedLayoutRoute>} />
      <Route path="/my-badges" element={<ProtectedLayoutRoute><BadgeGallery /></ProtectedLayoutRoute>} />
      <Route path="/about" element={<ProtectedLayoutRoute><AboutSystem /></ProtectedLayoutRoute>} />
    </>
  );
};
