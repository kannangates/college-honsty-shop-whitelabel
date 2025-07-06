
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useISOCompliance } from '@/hooks/useISOCompliance';
import { getCurrentTheme, getBrandingConfig } from '@/config/dynamic';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { PasswordRecoveryForm } from '@/components/auth/PasswordRecoveryForm';
import { EnhancedImage } from '@/components/common/EnhancedImage';

export const AuthPage = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'recovery'>('login');
  const [themeLoaded, setThemeLoaded] = useState(false);
  const theme = getCurrentTheme();
  
  // Initialize ISO compliance for this component
  const { trackUserAction, recordError } = useISOCompliance('AuthPage');

  useEffect(() => {
    // Ensure branding is loaded
    getBrandingConfig().then(() => {
      setThemeLoaded(true);
    }).catch((error) => {
      console.error('Failed to load branding:', error);
      setThemeLoaded(true); // Still show the page with fallback
    });
  }, []);

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

  const handleToggleForm = async (mode: 'login' | 'signup' | 'recovery') => {
    await trackUserAction('toggle_auth_form', { 
      switching_to: mode 
    });
    setAuthMode(mode);
  };

  const renderAuthForm = () => {
    switch (authMode) {
      case 'signup':
        return <SignupForm onToggleLogin={() => handleToggleForm('login')} />;
      case 'recovery':
        return <PasswordRecoveryForm onBack={() => handleToggleForm('login')} />;
      default:
        return (
          <LoginForm 
            onToggleSignup={() => handleToggleForm('signup')}
            onShowPasswordReset={() => handleToggleForm('recovery')}
          />
        );
    }
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

      <section className="w-full max-w-2xl mx-auto relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        {/* Header Section */}
        <div className="flex h-32 md:h-40 w-full border-b border-gray-100/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
          {/* Logo Box */}
          <div className="flex items-center justify-center w-24 md:w-32 h-full">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-30"></div>
              <EnhancedImage
                src={theme.logo.url}
                alt="College Logo"
                className="relative w-16 h-16 md:w-20 md:h-20 object-contain rounded-2xl shadow-lg bg-white/80 p-2"
                fallbackSrc={theme.logo.fallback}
                onError={handleImageError}
              />
            </div>
          </div>
          {/* College Details */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-1">
              {theme.portal_name} ✨
            </h1>
            <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
              {theme.tagline}
              <br />
              <span className="text-purple-600 font-medium">{theme.subtitle}</span>
            </p>
          </div>
        </div>
        {/* Form Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {renderAuthForm()}
        </div>
      </section>
    </div>
  );
};

export default AuthPage;
