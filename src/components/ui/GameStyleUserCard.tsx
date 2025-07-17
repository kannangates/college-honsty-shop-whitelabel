
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/features/gamification/components/badge';
import { Button } from '@/components/ui/button';
import { Crown, Medal, Star, Trophy, TrendingUp, Zap, Target } from 'lucide-react';

interface User {
  id?: string;
  student_id?: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  points?: number;
}

interface GameStyleUserCardProps {
  user: User | null;
  rank?: number;
  onCelebration?: () => void;
}

const GameStyleUserCard = ({ user, rank, onCelebration }: GameStyleUserCardProps) => {
  if (!user) {
    return (
      <Card className="bg-white/30 backdrop-blur-lg border border-blue-200/50 shadow-xl rounded-2xl h-full">
        <CardContent className="p-6 text-center h-full flex flex-col justify-center">
          <div className="animate-pulse">
            <div className="h-16 w-16 bg-blue-300/50 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-blue-300/50 rounded mb-2"></div>
            <div className="h-3 bg-blue-300/50 rounded mb-4"></div>
          </div>
          <p className="text-blue-600">Loading profile...</p>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = () => {
    if (!rank) return <Trophy className="h-6 w-6 text-blue-400" />;
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Star className="h-6 w-6 text-amber-600" />;
    return <Trophy className="h-6 w-6 text-blue-500" />;
  };

  const getRankGradient = () => {
    if (!rank) return 'from-blue-400/80 to-indigo-600/80';
    if (rank === 1) return 'from-yellow-400/80 to-yellow-600/80';
    if (rank === 2) return 'from-gray-300/80 to-gray-500/80';
    if (rank === 3) return 'from-amber-400/80 to-amber-600/80';
    if (rank <= 10) return 'from-blue-400/80 to-blue-600/80';
    return 'from-purple-400/80 to-purple-600/80';
  };

  const getRankTitle = () => {
    if (!rank) return 'Unranked';
    if (rank === 1) return 'Champion';
    if (rank === 2) return 'Runner-up';
    if (rank === 3) return 'Third Place';
    if (rank <= 10) return 'Top 10';
    return `Rank #${rank}`;
  };

  return (
    <Card className={`bg-gradient-to-br ${getRankGradient()} backdrop-blur-lg border border-blue-200/50 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-2xl h-full`}>
      <CardContent className="p-6 h-full flex flex-col justify-center">
        <div className="text-center">
          {/* Profile Section */}
          <div className="relative mb-6">
            <div className="h-20 w-20 bg-white/20 rounded-full mx-auto flex items-center justify-center mb-4 backdrop-blur-sm border-4 border-white/30">
              <span className="text-3xl font-bold text-white">
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            
            {rank && rank <= 3 && (
              <div className="absolute -top-2 -right-8 animate-bounce">
                {rank === 1 && '👑'}
                {rank === 2 && '🥈'}
                {rank === 3 && '🥉'}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {user.name || 'Unknown User'}
              </h2>
              <Badge className="bg-white/20 text-white border-0 mb-2 backdrop-blur-sm">
                {user.student_id || 'No ID'}
              </Badge>
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              {getRankIcon()}
              <span className="text-lg font-semibold">{getRankTitle()}</span>
            </div>

            {/* Points Display */}
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm border border-white/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-medium">Total Points</span>
              </div>
              <div className="text-3xl font-bold">{user.points || 0}</div>
            </div>

            {/* Department */}
            {user.department && (
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm border border-white/30">
                <div className="flex items-center justify-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">{user.department}</span>
                </div>
              </div>
            )}

            {/* Celebration Button */}
            {onCelebration && (
              <Button
                onClick={onCelebration}
                className="w-full bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 backdrop-blur-sm transition-all duration-300"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Celebrate Progress!
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameStyleUserCard;
