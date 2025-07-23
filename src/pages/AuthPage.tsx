import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import { useISOCompliance } from '@/hooks/useISOCompliance';
import { WHITELABEL_CONFIG } from '@/config';
import { LoginForm } from '@/components/auth/LoginForm';
import { EnhancedImage } from '@/components/common/EnhancedImage';

export interface AuthPageProps { initialMode?: 'login' | 'recovery'; }

const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'recovery'>(initialMode);
  const [themeLoaded, setThemeLoaded] = useState(false);
  const theme = WHITELABEL_CONFIG.branding;
  
  // Initialize ISO compliance for this component
  const { trackUserAction, recordError } = useISOCompliance('AuthPage');

  useEffect(() => {
    // Ensure branding is loaded
    // getBrandingConfig().then(() => { // This line is removed as per the edit hint
    //   setThemeLoaded(true);
    // }).catch((error) => { // This line is removed as per the edit hint
    //   console.error('Failed to load branding:', error); // This line is removed as per the edit hint
    //   setThemeLoaded(true); // Still show the page with fallback // This line is removed as per the edit hint
    // }); // This line is removed as per the edit hint
    setThemeLoaded(true); // Assuming branding is always available or handled elsewhere
  }, []);

  // Sync authMode with initialMode prop changes
  useEffect(() => {
    setAuthMode(initialMode);
  }, [initialMode]);

  if (loading || !themeLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your experience... ✨</p>
        </div>
      </div>
    );
  }
  
  if (user) return <Navigate to="/dashboard" replace />;

  const handleImageError = (error: Error) => {
    console.warn('Image loading error:', error);
    recordError(error, 'low');
  };

  const handleToggleForm = async (mode: 'login' | 'recovery') => {
    await trackUserAction('toggle_auth_form', { 
      switching_to: mode 
    });
    setAuthMode(mode);
  };

  const renderAuthForm = () => {
    return <LoginForm />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-pink-300/15 rounded-full blur-2xl animate-pulse animation-delay-1000"></div>
      </div>

      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <section className="w-full max-w-screen-2xl mx-auto relative z-10">
        {/* Header Section - Improved styling */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Logo */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-30"></div>
            <EnhancedImage
              src="/college-logo.jpg"
              alt="College Logo"
              className="relative w-16 h-16 md:w-20 md:h-20 object-cover rounded-2xl shadow-xl border-2 border-white/30 backdrop-blur-sm"
              fallbackSrc={theme.logo.fallback}
              onError={handleImageError}
            />
          </div>
          {/* College Details */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
              {theme.portal_name} ✨
            </h1>
            <div className="text-white/90 text-sm md:text-base leading-relaxed drop-shadow-md space-y-1">
              <p>{WHITELABEL_CONFIG.app.tagline}</p>
              <p className="text-white/80 font-medium">{WHITELABEL_CONFIG.app.subtitle}</p>
            </div>
          </div>
        </div>
        {/* Form Section - No background wrapper */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {renderAuthForm()}
        </div>
      </section>
    </div>
  );
};

export default AuthPage;
