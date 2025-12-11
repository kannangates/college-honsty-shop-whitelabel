import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/features/gamification/components/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Target } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UserProfile {
  id?: string;
  name?: string;
  student_id?: string;
  department?: string;
  points?: number;
  email?: string;
  role?: string;
}

interface PositionContextItem {
  student_id: string;
  name: string;
  department: string;
  points: number;
  rank: number;
  isCurrentUser: boolean;
}

interface UserPositionCardProps {
  profile: UserProfile;
  currentUserRank?: number;
  positionContext: PositionContextItem[];
  onCelebration?: () => void;
  contextOnly?: boolean;
}

const UserPositionCard = ({ profile, currentUserRank, positionContext, onCelebration, contextOnly = false }: UserPositionCardProps) => {
  if (contextOnly) {
    // Only render the Position Context for full-width row
    return (
      <Card className="bg-white/30 backdrop-blur-lg border border-blue-200/50 shadow-xl rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-500/80 to-cyan-600/80 text-white rounded-t-2xl backdrop-blur-sm">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Position Context
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-3">
            {positionContext?.map((student, index) => (
              <Card
                key={student.student_id}
                className={`p-4 ${student.isCurrentUser ? 'bg-blue-100/70 border-blue-300' : 'bg-white/50 border-blue-200/50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={student.isCurrentUser ? 'default' : 'outline'} className={student.isCurrentUser ? 'bg-blue-500' : 'border-blue-300'}>
                      #{student.rank}
                    </Badge>
                    <div>
                      <p className={`font-medium ${student.isCurrentUser ? 'text-blue-800 font-bold' : 'text-blue-700'}`}>
                        {student.name}
                        {student.isCurrentUser && ' (You)'}
                      </p>
                      <p className="text-sm text-blue-600">{student.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-800">{student.points}</p>
                    <p className="text-xs text-blue-600">points</p>
                  </div>
                </div>
              </Card>
            ))}
            {(!positionContext || positionContext.length === 0) && (
              <div className="text-center py-8 text-blue-600">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                <p>No ranking data available</p>
              </div>
            )}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block">
            <div className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-200/50">
                    <TableHead className="text-blue-800 font-semibold">Rank</TableHead>
                    <TableHead className="text-blue-800 font-semibold">Name</TableHead>
                    <TableHead className="text-blue-800 font-semibold">Department</TableHead>
                    <TableHead className="text-right text-blue-800 font-semibold">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positionContext?.map((student, index) => (
                    <TableRow
                      key={student.student_id}
                      className={student.isCurrentUser ? 'bg-blue-100/50 font-semibold border-blue-200/50' : 'border-blue-100/50'}
                    >
                      <TableCell>
                        <Badge variant={student.isCurrentUser ? 'default' : 'outline'} className={student.isCurrentUser ? 'bg-blue-500' : 'border-blue-300'}>
                          #{student.rank}
                        </Badge>
                      </TableCell>
                      <TableCell className={student.isCurrentUser ? 'font-bold text-blue-800' : 'text-blue-700'}>
                        {student.name}
                        {student.isCurrentUser && ' (You)'}
                      </TableCell>
                      <TableCell className="text-blue-700">{student.department}</TableCell>
                      <TableCell className="text-right font-medium text-blue-800">
                        {student.points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(!positionContext || positionContext.length === 0) && (
                <div className="text-center py-8 text-blue-600">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                  <p>No ranking data available</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Original full component for backwards compatibility
  return (
    <div className="lg:col-span-3 space-y-6">
      {/* User Quick Stats */}
      <Card className="bg-gradient-to-br from-blue-400/80 to-indigo-600/80 text-white border border-blue-200/50 shadow-lg backdrop-blur-lg rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold">{profile?.name?.charAt(0)?.toUpperCase() || '?'}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile?.name || 'Unknown User'}</h2>
                <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">{profile?.student_id || 'No ID'}</Badge>
                <p className="text-blue-200 mt-1">{profile?.department || 'No Department'}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5" />
                <span className="text-lg">Rank #{currentUserRank || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                <span className="text-2xl font-bold">{profile?.points || 0} pts</span>
              </div>
            </div>
          </div>
          {onCelebration && (
            <Button
              onClick={onCelebration}
              className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Celebrate Progress!
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Position Context Table */}
      <Card className="bg-white/30 backdrop-blur-lg border border-blue-200/50 shadow-xl rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-500/80 to-cyan-600/80 text-white rounded-t-2xl backdrop-blur-sm">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Position Context
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-blue-200/50">
                  <TableHead className="text-blue-800 font-semibold">Rank</TableHead>
                  <TableHead className="text-blue-800 font-semibold">Name</TableHead>
                  <TableHead className="text-blue-800 font-semibold">Department</TableHead>
                  <TableHead className="text-right text-blue-800 font-semibold">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positionContext?.map((student, index) => (
                  <TableRow
                    key={student.student_id}
                    className={student.isCurrentUser ? 'bg-blue-100/50 font-semibold border-blue-200/50' : 'border-blue-100/50'}
                  >
                    <TableCell>
                      <Badge variant={student.isCurrentUser ? 'default' : 'outline'} className={student.isCurrentUser ? 'bg-blue-500' : 'border-blue-300'}>
                        #{student.rank}
                      </Badge>
                    </TableCell>
                    <TableCell className={student.isCurrentUser ? 'font-bold text-blue-800' : 'text-blue-700'}>
                      {student.name}
                      {student.isCurrentUser && ' (You)'}
                    </TableCell>
                    <TableCell className="text-blue-700">{student.department}</TableCell>
                    <TableCell className="text-right font-medium text-blue-800">
                      {student.points}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(!positionContext || positionContext.length === 0) && (
              <div className="text-center py-8 text-blue-600">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                <p>No ranking data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPositionCard;
