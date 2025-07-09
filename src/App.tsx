import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProductProvider } from '@/contexts/ProductContext';
import { BrandingProvider } from '@/config/branding';
import AppRoutes from '@/routes';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <BrandingProvider>
          <AuthProvider>
            <ProductProvider>
              <AppRoutes />
              <Toaster position="top-right" />
            </ProductProvider>
          </AuthProvider>
        </BrandingProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
