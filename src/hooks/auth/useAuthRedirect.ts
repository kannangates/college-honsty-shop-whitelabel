
export const useAuthRedirect = () => {
  const handleSuccessfulLogin = () => {
    // Always redirect to dashboard after successful login
    // Clear any stored redirect URL to prevent future issues
    localStorage.removeItem('redirectAfterLogin');
    console.log('🔄 Redirecting to dashboard after login');
    window.location.href = '/dashboard';
  };

  return { handleSuccessfulLogin };
};
