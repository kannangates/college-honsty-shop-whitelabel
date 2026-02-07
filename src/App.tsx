import React, { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { Loader2 } from "lucide-react";
import { LoadingSpinner } from "./components/common/LoadingSpinner";
import { registerServiceWorker } from "./utils/registerServiceWorker";
import GlobalErrorBoundary from "./components/common/GlobalErrorBoundary";

// Environment check removed for production

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
    const initApp = async () => {
      try {
        const APP_VERSION = '2.0.0';
        const storedVersion = localStorage.getItem('app_version');
        
        if (storedVersion && storedVersion !== APP_VERSION) {
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
          }
          localStorage.setItem('app_version', APP_VERSION);
        } else if (!storedVersion) {
          localStorage.setItem('app_version', APP_VERSION);
        }

        if (import.meta.env.PROD) {
          registerServiceWorker();
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsInitialized(true);
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
