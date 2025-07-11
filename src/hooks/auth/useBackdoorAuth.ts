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

const DEMO_USERS = [
  {
    username: 'admin',
    password: ADMIN_PASSWORD,
    role: 'developer',
    name: 'Kannan',
    student_id: 'DEV001',
    department: 'All Department',
    mobile_number: '9940117071',
    shift: 'full',
    points: 9999,
    email: 'kannangates@gmail.com',
  },
  {
    username: 'student',
    password: STUDENT_PASSWORD,
    role: 'student',
    name: 'Demo Student',
    student_id: 'STU001',
    department: 'Computer Science',
    mobile_number: '9000000000',
    shift: '1',
    points: 1000,
    email: 'studentdemo@example.com',
  },
];

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const STUDENT_PASSWORD = import.meta.env.VITE_STUDENT_PASSWORD;
const FAKE_ACCESS_TOKEN = import.meta.env.VITE_FAKE_ACCESS_TOKEN;

export const useBackdoorAuth = ({
  setUser,
  setProfile,
  setSession,
  setBackdoorMode,
  setLoading,
  handleSuccessfulLogin
}: UseBackdoorAuthProps) => {
  const attemptBackdoorLogin = (studentId: string, password: string): boolean => {
    if (isBackdoorEnabled) {
      const demo = DEMO_USERS.find(u => u.username === studentId && u.password === password);
      if (demo) {
        console.log('🚪 Backdoor login successful for', demo.role);
        const fakeUser = { id: demo.mobile_number, email: demo.email };
        const fakeSession = {
          user: fakeUser,
          access_token: FAKE_ACCESS_TOKEN,
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
          role: demo.role,
          name: demo.name,
          student_id: demo.student_id,
          department: demo.department,
          mobile_number: demo.mobile_number,
          shift: demo.shift,
          points: demo.points,
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
        // Persist in localStorage
        localStorage.setItem('backdoorMode', 'true');
        localStorage.setItem('backdoorUser', JSON.stringify(fakeUser));
        localStorage.setItem('backdoorProfile', JSON.stringify(fakeProfile));
        localStorage.setItem('backdoorSession', JSON.stringify(fakeSession));
        handleSuccessfulLogin();
        return true;
      }
    }
    return false;
  };

  return { attemptBackdoorLogin };
};
