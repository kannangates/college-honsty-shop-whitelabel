import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./src/components/ui/toaster";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ProductProvider } from "./src/contexts/ProductContext";
import AuthPage from "./src/pages/AuthPage";
import { UserRoutes } from "./src/routes/UserRoutes";
import { AdminRoutes } from "./src/routes/AdminRoutes";
import NotFound from "./src/pages/NotFound";
import { Navigate } from "react-router-dom";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <ProductProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="/auth" element={<AuthPage />} />
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
