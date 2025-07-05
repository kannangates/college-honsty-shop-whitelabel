
import { BACKDOOR_USERNAME, BACKDOOR_PASSWORD, isBackdoorEnabled } from '@/utils/authUtils';
import type { User, Session } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

type UserProfile = Tables<'users'>;

interface UseBackdoorAuthProps {
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setSession: (session: Session | null) => void;
  setBackdoorMode: (mode: boolean) => void;
  setLoading: (loading: boolean) => void;
  handleSuccessfulLogin: () => void;
}

export const useBackdoorAuth = ({
  setUser,
  setProfile,
  setSession,
  setBackdoorMode,
  setLoading,
  handleSuccessfulLogin
}: UseBackdoorAuthProps) => {
  const attemptBackdoorLogin = (studentId: string, password: string): boolean => {
    if (isBackdoorEnabled && studentId === BACKDOOR_USERNAME && password === BACKDOOR_PASSWORD) {
      console.log('🚪 Backdoor login successful');
      const fakeUser = { id: '9940117071', email: 'kannangates@gmail.com' };
      const fakeSession = {
        user: fakeUser,
        access_token: 'fake-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: '',
        provider_token: null,
        provider_refresh_token: null,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      } as Session;
      const fakeProfile: UserProfile = {
        id: fakeUser.id,
        email: fakeUser.email,
        role: 'developer',
        name: 'Kannan',
        student_id: 'DEV001',
        department: 'All Department',
        mobile_number: '9940117071',
        shift: 'full',
        points: 9999,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_signed_in_at: new Date().toISOString(),
        updated_by: null,
      } as UserProfile;

      setUser(fakeUser as User);
      setProfile(fakeProfile);
      setSession(fakeSession);
      setBackdoorMode(true);
      setLoading(false);
      handleSuccessfulLogin();
      return true;
    }
    return false;
  };

  return { attemptBackdoorLogin };
};
