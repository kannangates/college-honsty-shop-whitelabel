import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Award, Trophy } from 'lucide-react';
import RankingCarousel from '@/components/ui/RankingCarousel';

interface RankingItem {
  id: string;
  name: string;
  points: number;
  rank: number;
  student_id?: string;
  department?: string;
}

interface RankingsSectionProps {
  topStudents: RankingItem[];
  topDepartments: RankingItem[];
  currentUserId?: string;
  singleColumn?: boolean;
}

const RankingsSection = ({ topStudents, topDepartments, currentUserId, singleColumn = false }: RankingsSectionProps) => {
  if (singleColumn) {
    // Show both Top Students and Top Departments in vertical layout when in single column mode
    return (
      <div className="space-y-6 h-full flex flex-col">
        {/* Top Students Card */}
        <Card className="bg-white/30 backdrop-blur-lg border border-blue-200/50 shadow-xl rounded-2xl flex-1 flex flex-col">
          <CardHeader className="bg-gradient-to-r from-blue-500/80 to-indigo-600/80 text-white rounded-t-2xl backdrop-blur-sm">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6" />
              🏆 Top Student Rankers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col">
            {(!topStudents || topStudents.length === 0) ? (
              <div className="text-center py-8 text-blue-600 flex-1 flex flex-col justify-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                <p>No student rankings available</p>
              </div>
            ) : (
              <RankingCarousel
                items={topStudents}
                type="student"
                currentUserId={currentUserId}
              />
            )}
          </CardContent>
        </Card>

        {/* Top Departments Card */}
        <Card className="bg-white/30 backdrop-blur-lg border border-blue-200/50 shadow-xl rounded-2xl flex-1 flex flex-col">
          <CardHeader className="bg-gradient-to-r from-indigo-500/80 to-purple-600/80 text-white rounded-t-2xl backdrop-blur-sm">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-6 w-6" />
              🏛️ Top Department Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col">
            {(!topDepartments || topDepartments.length === 0) ? (
              <div className="text-center py-8 text-blue-600 flex-1 flex flex-col justify-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                <p>No department rankings available</p>
              </div>
            ) : (
              <RankingCarousel
                items={topDepartments}
                type="department"
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Original two-column layout for other uses
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Top Students */}
      <Card className="bg-white/30 backdrop-blur-lg border border-blue-200/50 shadow-xl rounded-2xl h-full flex flex-col">
        <CardHeader className="bg-gradient-to-r from-blue-500/80 to-indigo-600/80 text-white rounded-t-2xl backdrop-blur-sm">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6" />
            🏆 Top Student Rankers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex-1 flex flex-col">
          {(!topStudents || topStudents.length === 0) ? (
            <div className="text-center py-8 text-blue-600 flex-1 flex flex-col justify-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-blue-400" />
              <p>No student rankings available</p>
            </div>
          ) : (
            <RankingCarousel
              items={topStudents}
              type="student"
              currentUserId={currentUserId}
            />
          )}
        </CardContent>
      </Card>

      {/* Top Departments */}
      <Card className="bg-white/30 backdrop-blur-lg border border-blue-200/50 shadow-xl rounded-2xl h-full flex flex-col">
        <CardHeader className="bg-gradient-to-r from-indigo-500/80 to-purple-600/80 text-white rounded-t-2xl backdrop-blur-sm">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6" />
            🏛️ Top Department Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex-1 flex flex-col">
          {(!topDepartments || topDepartments.length === 0) ? (
            <div className="text-center py-8 text-blue-600 flex-1 flex flex-col justify-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-blue-400" />
              <p>No department rankings available</p>
            </div>
          ) : (
            <RankingCarousel
              items={topDepartments}
              type="department"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingsSection;
