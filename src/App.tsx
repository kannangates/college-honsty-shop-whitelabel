
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProductProvider } from "@/contexts/ProductContext";
import AuthPage from "@/pages/AuthPage";
import { UserRoutes } from "@/routes/UserRoutes";
import { AdminRoutes } from "@/routes/AdminRoutes";
import NotFound from "@/pages/NotFound";
import { Navigate } from "react-router-dom";
import { getBrandingConfig } from "@/config";
import { useEffect } from "react";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    // Initialize branding configuration on app start
    getBrandingConfig().catch(console.error);
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
          </ProductProvider>
        </AuthProvider>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
