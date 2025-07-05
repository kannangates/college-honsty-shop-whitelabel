
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useISOCompliance } from '@/hooks/useISOCompliance';
import { CONFIG, getLogoUrl } from '@/config';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { PasswordRecoveryForm } from '@/components/auth/PasswordRecoveryForm';
import { EnhancedImage } from '@/components/common/EnhancedImage';

export const AuthPage = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'recovery'>('login');
  
  // Initialize ISO compliance for this component
  const { trackUserAction, recordError } = useISOCompliance('AuthPage');

  if (loading) return null;
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
    <div className="min-h-screen bg-gradient-to-br from-[#202072] via-[#f5f1f4] to-[#e66166] flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-30">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e66166' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <section className="w-full max-w-2xl mx-auto relative z-10 bg-white/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header Section */}
        <div className="flex h-40 md:h-48 w-full border-b border-gray-200">
          {/* Logo Box */}
          <div className="flex items-center justify-center w-32 md:w-40 h-full">
            <EnhancedImage
              src={getLogoUrl()}
              alt="College Logo"
              className="w-20 h-20 md:w-28 md:h-28 object-contain rounded-lg shadow-md"
              fallbackSrc={CONFIG.IMAGES.COLLEGE_LOGO_FALLBACK}
              onError={handleImageError}
            />
          </div>
          {/* College Details */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#202072] to-[#e66166] bg-clip-text text-transparent mb-1">
              {CONFIG.APP.NAME}
            </h1>
            <p className="text-gray-700 text-sm md:text-base">
              {CONFIG.APP.TAGLINE}
              <br />
              {CONFIG.APP.SUBTITLE}
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
