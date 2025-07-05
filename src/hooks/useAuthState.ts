import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

type UserProfile = Tables<'users'>;

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [backdoorMode, setBackdoorMode] = useState(false);

  // Restore backdoor session from localStorage if present
  useEffect(() => {
    const isBackdoor = localStorage.getItem('backdoorMode') === 'true';
    if (isBackdoor) {
      setBackdoorMode(true);
      try {
        setUser(JSON.parse(localStorage.getItem('backdoorUser')!));
        setProfile(JSON.parse(localStorage.getItem('backdoorProfile')!));
        setSession(JSON.parse(localStorage.getItem('backdoorSession')!));
      } catch (e) {
        setUser(null);
        setProfile(null);
        setSession(null);
      }
      setLoading(false);
      return;
    }

    // Reduced timeout for faster loading experience
    const loadingTimeout = setTimeout(() => {
      console.warn('⚠️ Auth loading timeout reached, forcing loading to false');
      setLoading(false);
    }, 3000); // Reduced from 10 seconds to 3 seconds

    return () => clearTimeout(loadingTimeout);
  }, []);

  // Optimized profile fetching with shorter timeout
  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 2000) // Reduced from 5 seconds
      );
      
      const fetchPromise = supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as {
        data: UserProfile | null;
        error: { message: string } | null;
      };
      
      if (error) {
        console.error("❌ Profile fetch error:", error);
        setProfile(null);
        return;
      }
      
      console.log('✅ Profile loaded successfully:', data?.name, data?.student_id);
      setProfile(data);
    } catch (error) {
      console.error("❌ Profile fetch exception:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (backdoorMode) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let currentUserId: string | null = null;

    // Set up auth listener with improved error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!isMounted) return;
        
        console.log('🔄 Auth state changed:', event, newSession?.user?.email);
        
        // Always update session and user state
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Handle profile fetching - non-blocking
        const newUserId = newSession?.user?.id || null;
        if (newUserId && newUserId !== currentUserId) {
          currentUserId = newUserId;
          // Don't await profile fetch to avoid blocking auth flow
          fetchProfile(newUserId).catch(error => {
            console.error('❌ Profile fetch failed:', error);
            setLoading(false);
          });
        } else if (!newUserId) {
          currentUserId = null;
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session on mount with shorter timeout
    const initializeAuth = async () => {
      if (!isMounted) return;
      
      try {
        console.log('🚀 Initializing auth state...');
        
        // Reduced timeout for session check
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 2000) // Reduced from 5 seconds
        );
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session: existingSession }, error } = await Promise.race([
          sessionPromise, 
          timeoutPromise
        ]) as {
          data: { session: Session | null };
          error: { message: string } | null;
        };
        
        if (error) {
          console.error('❌ Session retrieval error:', error);
          setUser(null);
          setSession(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (!isMounted) return;

        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        
        if (existingSession?.user) {
          currentUserId = existingSession.user.id;
          // Non-blocking profile fetch
          fetchProfile(existingSession.user.id).catch(error => {
            console.error('❌ Error in initial profile fetch:', error);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('❌ Auth initialization error:', err);
        setUser(null);
        setSession(null);
        setProfile(null);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [backdoorMode]);

  return {
    user,
    profile,
    session,
    loading,
    setUser,
    setProfile,
    setSession,
    setBackdoorMode,
    setLoading,
    backdoorMode,
    fetchProfile
  };
};

export function clearBackdoorSession() {
  localStorage.removeItem('backdoorMode');
  localStorage.removeItem('backdoorUser');
  localStorage.removeItem('backdoorProfile');
  localStorage.removeItem('backdoorSession');
}
