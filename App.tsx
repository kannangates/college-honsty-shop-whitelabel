import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./src/components/ui/toaster";
import { PasswordChangePrompt } from "./src/components/common/PasswordChangePrompt";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ProductProvider } from "./src/contexts/ProductContext";
import AuthPage from "./src/pages/AuthPage";
import { UserRoutes } from "./src/routes/UserRoutes";
import { AdminRoutes } from "./src/routes/AdminRoutes";
import NotFound from "./src/pages/NotFound";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Initialize branding configuration on app start
    // If needed, use WHITELABEL_CONFIG for branding access
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ProductProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/auth" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<AuthPage initialMode="login" />} />
              <Route path="/signup" element={<AuthPage initialMode="signup" />} />
              {UserRoutes()}
              {AdminRoutes()}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <PasswordChangePrompt />
          </ProductProvider>
        </AuthProvider>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
