import React, { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { Loader2 } from "lucide-react";
import { LoadingSpinner } from "./components/common/LoadingSpinner";
import { registerServiceWorker } from "./utils/registerServiceWorker";
import GlobalErrorBoundary from "./components/common/GlobalErrorBoundary";
import "./App.css";

// Add debug logs for environment variables
console.log('Environment:', {
  NODE_ENV: import.meta.env.MODE,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not Set',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not Set',
});

// Lazy load components with proper type handling
const PasswordChangePrompt = lazy(
  () => import("./components/common/PasswordChangePrompt")
    .then(module => ({ default: module.PasswordChangePrompt }))
);

const AuthPage = lazy(
  () => import("./pages/AuthPage")
    .then(module => ({ default: module.default }))
);

const NotFound = lazy(
  () => import("./pages/NotFound")
    .then(module => ({ default: module.default }))
);

const UserRoutes = lazy(
  () => import("./routes/UserRoutes")
    .then(module => ({ default: module.UserRoutes }))
);

const AdminRoutes = lazy(
  () => import("./routes/AdminRoutes")
    .then(module => ({ default: module.AdminRoutes }))
);

// Import providers directly since they're needed immediately
import { AuthProvider } from "./contexts/AuthProvider";
import { ProductProvider } from "./contexts/ProductContext";

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

    const initApp = async () => {
      try {
        // Initialize branding configuration on app start
        console.log('Initializing app...');

        // Clear old cache if version changed (for all environments)
        const APP_VERSION = '2.0.0';
        const storedVersion = localStorage.getItem('app_version');
        
        if (storedVersion && storedVersion !== APP_VERSION) {
          console.log('🔄 App version updated, clearing old caches...');
          
          // Clear caches
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('✅ Caches cleared');
          }
          
          // Update version
          localStorage.setItem('app_version', APP_VERSION);
        } else if (!storedVersion) {
          // First time, set version
          localStorage.setItem('app_version', APP_VERSION);
        }

        // Register service worker in production
        if (import.meta.env.PROD) {
          console.log('Registering service worker...');
          registerServiceWorker();
        }

        setIsInitialized(true);
        console.log('App initialized successfully');
      } catch (error) {
        console.error('Error during app initialization:', error);
        setIsInitialized(true); // Still allow app to load
      }
    };

    initApp();
  }, []);

  if (!isInitialized) {
    return <LoadingSpinner fullScreen text="Initializing application..." />;
  }

  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Suspense fallback={<LoadingSpinner fullScreen text="Loading page..." />}>
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
