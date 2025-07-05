
export const useAuthCleanup = () => {
  const cleanupAuthState = () => {
    console.log('🧹 Cleaning up auth state');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) localStorage.removeItem(key);
    });
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) sessionStorage.removeItem(key);
    });
  };

  return { cleanupAuthState };
};
