
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import AuthPage from '@/pages/AuthPage';

export const AuthRoutes = () => {
  return (
    <>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage />} />
    </>
  );
};
