import React, { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./src/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { registerServiceWorker } from "./src/utils/registerServiceWorker";
import GlobalErrorBoundary from "./src/components/common/GlobalErrorBoundary";
import "./App.css";

// Add debug logs for environment variables
console.log('Environment:', {
  NODE_ENV: import.meta.env.MODE,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not Set',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not Set',
});

// Lazy load components with proper type handling
const PasswordChangePrompt = lazy(
  () => import("./src/components/common/PasswordChangePrompt")
    .then(module => ({ default: module.PasswordChangePrompt }))
);

const AuthPage = lazy(
  () => import("./src/pages/AuthPage")
    .then(module => ({ default: module.default }))
);

const NotFound = lazy(
  () => import("./src/pages/NotFound")
    .then(module => ({ default: module.default }))
);

const UserRoutes = lazy(
  () => import("./src/routes/UserRoutes")
    .then(module => ({ default: module.UserRoutes }))
);

const AdminRoutes = lazy(
  () => import("./src/routes/AdminRoutes")
    .then(module => ({ default: module.AdminRoutes }))
);

// Import providers directly since they're needed immediately
import { AuthProvider } from "./src/contexts/AuthProvider";
import { ProductProvider } from "./src/contexts/ProductContext";

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="w-8 h-8 animate-spin" />
  </div>
);

const queryClient = new QueryClient();

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('App mounted');
    
    try {
      // Initialize branding configuration on app start
      console.log('Initializing app...');
      
      // Register service worker in production
      if (import.meta.env.PROD) {
        console.log('Registering service worker...');
        registerServiceWorker();
      }
      
      setIsInitialized(true);
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Error during app initialization:', error);
    }
  }, []);
  
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Suspense
            fallback={
              <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            }
          >
            <AuthProvider>
              <ProductProvider>
                <Routes>
                  <Route path="/" element={<Navigate to="/auth" replace />} />
                  <Route 
                    path="/auth" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <AuthPage />
                      </Suspense>
                    } 
                  />
                  <Route path="/login" element={<Navigate to="/auth" replace />} />
                  <Route path="/signup" element={<Navigate to="/auth" replace />} />
                  <Route path="/*" element={<UserRoutes />} />
                  <Route path="/admin/*" element={<AdminRoutes />} />
                  <Route 
                    path="*" 
                    element={
                      <Suspense fallback={<LoadingFallback />}>
                        <NotFound />
                      </Suspense>
                    } 
                  />
                </Routes>
                <PasswordChangePrompt />
              </ProductProvider>
            </AuthProvider>
          </Suspense>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
