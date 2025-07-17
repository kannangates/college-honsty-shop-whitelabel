import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useBadgeService = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [badgeProgress, setBadgeProgress] = useState({
    currentTier: null,
    nextTier: null,
    progress: 0,
    earnedBadges: [],
    totalBadges: 0
  });
  const [overallProgress, setOverallProgress] = useState({
    currentTier: null,
    nextTier: null,
    progress: 0,
    earnedBadges: [],
    totalBadges: 0
  });
  const [loading, setLoading] = useState(true);

  // ... (rest of the hook implementation as in the original file)

  return {
    badges,
    userBadges,
    badgeProgress,
    overallProgress,
    loading,
    // ... (other returned functions)
  };
}; 