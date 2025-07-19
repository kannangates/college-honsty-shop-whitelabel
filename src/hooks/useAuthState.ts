
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { UserProfile } from '@/types/auth';
import { AuthService } from '@/services/authService';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Increased timeout for more reliable auth loading
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      console.warn('⚠️ Auth loading timeout reached, forcing loading to false');
      setLoading(false);
    }, 3000); // Increased from 1000ms to 3000ms for more reliable auth

    return () => clearTimeout(loadingTimeout);
  }, []);

  // Optimized profile fetching with shorter timeout
  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 1500) // Increased from 800ms to 1500ms
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
      
      setProfile(data);
    } catch (error) {
      console.error("❌ Profile fetch exception:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let currentUserId: string | null = null;

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!isMounted) return;
        
        // Always update session and user state immediately
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Handle profile fetching - non-blocking and faster
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

    // Check for existing session on mount - optimized for speed
    const initializeAuth = async () => {
      if (!isMounted) return;
      
      try {
        // Try to restore session from our custom storage first
        const { session: restoredSession, profile: restoredProfile } = await AuthService.restoreSession();
        
        if (restoredSession && restoredProfile) {
          if (!isMounted) return;
          setSession(restoredSession);
          setUser(restoredSession.user);
          setProfile(restoredProfile);
          setLoading(false);
          return;
        }

        // Fallback to regular session check with shorter timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 1500) // Increased from 800ms to 1500ms
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
  }, []);

  return {
    user,
    profile,
    session,
    loading,
    setUser,
    setProfile,
    setSession,
    setLoading,
    fetchProfile,
  };
};
