
export const useAuthRedirect = () => {
  const handleSuccessfulLogin = () => {
    // Check for stored redirect URL
    const redirectUrl = localStorage.getItem('redirectAfterLogin');
    if (redirectUrl && redirectUrl !== '/auth') {
      localStorage.removeItem('redirectAfterLogin');
      console.log('🔄 Redirecting to stored URL:', redirectUrl);
      window.location.href = redirectUrl;
    } else {
      console.log('🔄 Redirecting to dashboard');
      window.location.href = '/dashboard';
    }
  };

  return { handleSuccessfulLogin };
};
