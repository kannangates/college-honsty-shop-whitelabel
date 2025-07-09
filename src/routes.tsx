import { Route, Routes, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load pages using barrel file
const { 
  HomePage, 
  LoginPage, 
  SignupPage, 
  NotFoundPage 
} = {
  HomePage: lazy(() => import('./pages/HomePage')),
  LoginPage: lazy(() => import('./pages/LoginPage')),
  SignupPage: lazy(() => import('./pages/SignupPage')),
  NotFoundPage: lazy(() => import('./pages/NotFoundPage'))
};

// Loading component for Suspense fallback
const Loading = () => <div>Loading...</div>;

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
