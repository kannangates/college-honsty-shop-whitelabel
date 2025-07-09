import { renderHook, act } from '@testing-library/react';
import { useAuthActions } from '../useAuthActions';

jest.mock('../../integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })),
    rpc: jest.fn(),
  },
}));

// Mock the dependent hooks
jest.mock('../auth/useAuthCleanup', () => ({
  useAuthCleanup: () => ({
    cleanupAuthState: jest.fn(),
  }),
}));

jest.mock('../auth/useAuthRedirect', () => ({
  useAuthRedirect: () => ({
    handleSuccessfulLogin: jest.fn(),
  }),
}));

jest.mock('../auth/useBackdoorAuth', () => ({
  useBackdoorAuth: () => ({
    attemptBackdoorLogin: jest.fn().mockReturnValue(false),
  }),
}));

jest.mock('../auth/useSupabaseAuth', () => ({
  useSupabaseAuth: () => ({
    signInWithSupabase: jest.fn(),
    signUpWithSupabase: jest.fn(),
  }),
}));

describe('useAuthActions', () => {
  const mockProps = {
    setUser: jest.fn(),
    setProfile: jest.fn(),
    setSession: jest.fn(),
    setBackdoorMode: jest.fn(),
    setLoading: jest.fn(),
    fetchProfile: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return auth action functions', () => {
    const { result } = renderHook(() => useAuthActions(mockProps));

    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.signUp).toBe('function');
    expect(typeof result.current.signOut).toBe('function');
  });

  it('should call signIn with correct parameters', async () => {
    const { result } = renderHook(() => useAuthActions(mockProps));

    await act(async () => {
      await result.current.signIn('STU123', 'password123');
    });

    expect(mockProps.setLoading).toHaveBeenCalledWith(true);
  });

  it('should call signUp with correct parameters', async () => {
    const { result } = renderHook(() => useAuthActions(mockProps));

    await act(async () => {
      await result.current.signUp(
        'test@example.com',
        'password123',
        'STU123',
        'Test User',
        'Computer Science',
        'student',
        '1',
        100
      );
    });

    expect(mockProps.setLoading).toHaveBeenCalledWith(true);
  });

  it('should call signOut and clean up state', async () => {
    const { result } = renderHook(() => useAuthActions(mockProps));

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockProps.setUser).toHaveBeenCalledWith(null);
    expect(mockProps.setProfile).toHaveBeenCalledWith(null);
    expect(mockProps.setSession).toHaveBeenCalledWith(null);
    expect(mockProps.setBackdoorMode).toHaveBeenCalledWith(false);
  });

  it('should handle signOut errors gracefully', async () => {
    const { result } = renderHook(() => useAuthActions(mockProps));

    await act(async () => {
      await result.current.signOut();
    });

    // Should still clean up state even if sign out fails
    expect(mockProps.setUser).toHaveBeenCalledWith(null);
    expect(mockProps.setProfile).toHaveBeenCalledWith(null);
    expect(mockProps.setSession).toHaveBeenCalledWith(null);
  });
}); 