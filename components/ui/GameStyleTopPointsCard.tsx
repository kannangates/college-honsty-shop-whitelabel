
import React, { useEffect, useRef } from 'react';
import { Crown, Medal, Star, Trophy, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Student {
  id: string;
  student_id: string;
  name: string;
  department: string;
  points: number;
  rank: number;
}

interface GameStyleTopPointsCardProps {
  students: Student[];
  currentUserId?: string;
}

const GameStyleTopPointsCard = ({ students, currentUserId }: GameStyleTopPointsCardProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || students.length <= 3) return;

    let scrollPosition = 0;
    const scrollSpeed = 1;
    const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;

    const autoScroll = () => {
      scrollPosition += scrollSpeed;
      if (scrollPosition >= maxScroll) {
        scrollPosition = 0;
      }
      scrollContainer.scrollTop = scrollPosition;
    };

    const interval = setInterval(autoScroll, 50);

    const handleMouseEnter = () => clearInterval(interval);
    const handleMouseLeave = () => {
      const newInterval = setInterval(autoScroll, 50);
      return () => clearInterval(newInterval);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearInterval(interval);
      scrollContainer?.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [students.length]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Star className="h-6 w-6 text-amber-600" />;
    return <Trophy className="h-5 w-5 text-blue-500" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600 shadow-yellow-200';
    if (rank === 2) return 'from-gray-300 to-gray-500 shadow-gray-200';
    if (rank === 3) return 'from-amber-400 to-amber-600 shadow-amber-200';
    return 'from-blue-400 to-blue-600 shadow-blue-200';
  };

  const isCurrentUser = (studentId: string) => studentId === currentUserId;

  if (!students || students.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">No rankings available</p>
        <p className="text-sm">Start earning points to see the leaderboard!</p>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
    >
      <div className="space-y-3 p-4">
        {students.map((student) => (
          <div
            key={student.id}
            className={`relative p-4 rounded-xl bg-gradient-to-r ${getRankColor(student.rank)} text-white transform hover:scale-105 transition-all duration-300 shadow-lg ${
              isCurrentUser(student.student_id) ? 'ring-4 ring-purple-400 ring-opacity-60' : ''
            }`}
          >
            {isCurrentUser(student.student_id) && (
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-purple-500 text-white animate-pulse">
                  YOU
                </Badge>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getRankIcon(student.rank)}
                <div>
                  <p className="font-bold text-lg">{student.name}</p>
                  <p className="text-sm opacity-90">{student.department}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs bg-white/20 text-white border-0">
                      #{student.rank}
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-white/20 text-white border-0">
                      {student.student_id}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <p className="text-2xl font-bold">{student.points}</p>
                </div>
                <p className="text-sm opacity-90">points</p>
              </div>
            </div>
            
            {student.rank <= 3 && (
              <div className="absolute top-2 right-2">
                <div className="animate-pulse">
                  {student.rank === 1 && '🥇'}
                  {student.rank === 2 && '🥈'}
                  {student.rank === 3 && '🥉'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameStyleTopPointsCard;
