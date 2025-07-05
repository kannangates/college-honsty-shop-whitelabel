import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Award, Trophy, Star, Medal, Crown, Zap, Target, Sparkles, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  min_points: number;
  badge_type: string;
  image_url?: string;
  is_active: boolean;
  condition?: unknown;
}

interface UserBadge {
  badge_id: string;
  earned_at: string;
}

const BadgeGallery = () => {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadBadgesAndProgress();
  }, [profile]);

  const loadBadgesAndProgress = async () => {
    setLoading(true);
    try {
      // Load all active badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('min_points', { ascending: true });

      if (badgesError) throw badgesError;

      setBadges(badgesData || []);

      // Load user's earned badges if authenticated
      if (profile?.id) {
        const { data: userBadgesData, error: userBadgesError } = await supabase
          .from('user_badges')
          .select('badge_id, earned_at')
          .eq('user_id', profile.id);

        if (userBadgesError) throw userBadgesError;
        setUserBadges(userBadgesData || []);
      }
    } catch (error) {
      console.error('Error loading badges:', error);
      toast({
        title: 'Error',
        description: 'Failed to load badge information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate badge progress based on user points and badge requirements
  const badgeProgress = useMemo(() => {
    if (!profile?.points) return {};
    
    const userPoints = profile.points;
    const progress: { [key: string]: number } = {};
    
    badges.forEach(badge => {
      // Calculate progress percentage based on points requirement
      const progressPercentage = Math.min((userPoints / badge.min_points) * 100, 100);
      progress[badge.id] = progressPercentage;
    });
    
    return progress;
  }, [badges, profile?.points]);

  const getBadgeIcon = (badgeType: string, earned: boolean) => {
    const iconClass = `h-10 w-10 ${earned ? 'text-yellow-400 drop-shadow-lg' : 'text-gray-400'}`;
    
    switch (badgeType.toLowerCase()) {
      case 'tier':
        return <Award className={iconClass} />;
      case 'achievement':
        return <Trophy className={iconClass} />;
      case 'milestone':
        return <Star className={iconClass} />;
      case 'special':
        return <Crown className={iconClass} />;
      default:
        return <Medal className={iconClass} />;
    }
  };

  const isBadgeEarned = (badgeId: string) => {
    return userBadges.some(ub => ub.badge_id === badgeId);
  };

  const getBadgeStatus = (badge: BadgeData) => {
    const earned = isBadgeEarned(badge.id);
    const progress = badgeProgress[badge.id] || 0;
    
    if (earned) return 'earned';
    if (progress >= 100) return 'ready';
    return 'locked';
  };

  const getCardGradient = (status: string) => {
    switch (status) {
      case 'earned':
        return 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600';
      case 'ready':
        return 'bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600';
      case 'locked':
        return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500';
      default:
        return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'earned':
        return '🎉';
      case 'ready':
        return '✨';
      case 'locked':
        return '🔒';
      default:
        return '🔒';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="relative">
              <Award className="h-20 w-20 animate-pulse mx-auto mb-4 text-purple-400" />
              <Sparkles className="h-6 w-6 absolute -top-2 -right-2 text-pink-400 animate-bounce" />
            </div>
            <p className="text-gray-600 text-lg font-medium">Loading your badge collection...</p>
            <p className="text-gray-500 text-sm">✨ Preparing something amazing ✨</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Gen-Z Style Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-600 opacity-20 blur-3xl"></div>
          <div className="relative">
            <h1 className="text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent mb-4 drop-shadow-sm">
              Badge Gallery
            </h1>
            <div className="flex justify-center items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-pink-500" />
              <p className="text-xl text-gray-700 font-semibold">
                Collect badges & flex your achievements! 💪
              </p>
              <Sparkles className="h-6 w-6 text-purple-500" />
            </div>
            {profile && (
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="text-lg font-bold text-gray-800">
                  {profile.points || 0} points
                </span>
                <span className="text-sm text-gray-600">| Keep grinding! 🔥</span>
              </div>
            )}
          </div>
        </div>

        {/* Badge Grid - Gen-Z Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {badges.map((badge) => {
            const status = getBadgeStatus(badge);
            const progress = badgeProgress[badge.id] || 0;
            const earned = status === 'earned';

            return (
              <Card 
                key={badge.id} 
                className={`relative overflow-hidden transform transition-all duration-300 hover:scale-105 hover:rotate-1 border-0 shadow-xl ${
                  earned ? 'animate-pulse' : ''
                }`}
              >
                <div className={`absolute inset-0 ${getCardGradient(status)}`}></div>
                <div className="relative bg-white/90 backdrop-blur-sm m-2 rounded-lg">
                  <CardHeader className="text-center pb-3 relative">
                    {earned && (
                      <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                        🎉
                      </div>
                    )}
                    <div className="flex justify-center mb-3 relative">
                      {badge.image_url ? (
                        <div className="relative">
                          <img 
                            src={badge.image_url} 
                            alt={badge.name}
                            className={`w-20 h-20 rounded-full border-4 ${earned ? 'border-yellow-400 shadow-lg' : 'border-gray-300 grayscale opacity-60'}`}
                          />
                          {earned && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                              <Crown className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative">
                          {getBadgeIcon(badge.badge_type, earned)}
                          {earned && (
                            <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-yellow-400" />
                          )}
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-800">
                      {getStatusEmoji(status)} {badge.name}
                    </CardTitle>
                    <div className="flex justify-center">
                      <Badge 
                        className={`${
                          status === 'earned' ? 'bg-yellow-500 text-white' : 
                          status === 'ready' ? 'bg-blue-500 text-white' : 
                          'bg-gray-500 text-white'
                        } font-semibold`}
                      >
                        {status === 'earned' ? '✨ EARNED!' : 
                         status === 'ready' ? '🎯 READY!' : 
                         '🔒 LOCKED'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 text-center font-medium">
                        {badge.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-gray-700">Target:</span>
                          <span className="text-purple-600">{badge.min_points} pts</span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress 
                            value={progress} 
                            className={`h-3 ${earned ? 'bg-yellow-100' : 'bg-gray-200'}`}
                          />
                        </div>
                        
                        {profile && (
                          <div className="text-center">
                            {earned ? (
                              <div className="text-green-600 font-bold text-sm flex items-center justify-center gap-1">
                                <Gift className="h-4 w-4" />
                                <span>Badge Unlocked! 🎊</span>
                              </div>
                            ) : (
                              <div className="text-gray-600 text-xs">
                                <span className="font-semibold text-purple-600">
                                  {Math.max(0, badge.min_points - (profile.points || 0))}
                                </span> points to go! 💪
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>

        {badges.length === 0 && (
          <div className="text-center py-16">
            <div className="relative">
              <Award className="h-24 w-24 mx-auto mb-6 text-gray-300" />
              <Sparkles className="h-8 w-8 absolute top-0 right-1/2 transform translate-x-8 text-pink-300 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-gray-600 mb-3">No Badges Yet! 🚀</h3>
            <p className="text-gray-500 text-lg">
              Badges are being prepared by the admin team. Stay tuned! ✨
            </p>
          </div>
        )}

        {/* Gen-Z Style Stats Card */}
        {profile && userBadges.length > 0 && (
          <Card className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl font-black">
                <Trophy className="h-8 w-8" />
                Your Badge Stats 📊
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-4xl font-black mb-2">{userBadges.length}</div>
                  <p className="text-sm font-semibold opacity-90">Badges Earned 🏆</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-4xl font-black mb-2">{profile.points || 0}</div>
                  <p className="text-sm font-semibold opacity-90">Total Points ⚡</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-4xl font-black mb-2">
                    {Math.round((userBadges.length / Math.max(badges.length, 1)) * 100)}%
                  </div>
                  <p className="text-sm font-semibold opacity-90">Collection Complete 🎯</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Button 
                  className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 font-bold"
                  onClick={() => toast({ title: "Keep going! 🔥", description: "You're doing amazing!" })}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Keep Grinding! 💪
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BadgeGallery;
