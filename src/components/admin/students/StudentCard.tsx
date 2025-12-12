import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/features/gamification/components/badge';
import { Button } from '@/components/ui/button';
import { Edit, KeyRound, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentCardProps {
  student: {
    id: string;
    masked_student_id: string;
    name: string;
    department?: string;
    shift?: string;
    role: string;
    points: number;
    status: string;
    last_signed_in_at?: string;
  };
  onEdit: () => void;
  onResetPassword: () => void;
  className?: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();
};

const getStatusColor = (status: string) => {
  return status === 'active' ? 'bg-green-500' : 'bg-red-500';
};

const getPointsColor = (points: number) => {
  if (points > 1000) return 'bg-yellow-100 text-yellow-800';
  if (points > 800) return 'bg-green-100 text-green-800';
  return 'bg-blue-100 text-blue-800';
};

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onEdit,
  onResetPassword,
  className
}) => {
  return (
    <Card className={cn(
      "bg-gradient-to-br from-gray-100 to-gray-200 border-0 shadow-xl rounded-2xl overflow-hidden relative w-full",
      "h-48",
      className
    )}>
      <CardContent className="p-3 relative h-full overflow-hidden">
        {/* Points Badge - Top Right Left */}
        <div className="absolute top-2 right-16 z-10">
          <Badge className={cn(
            "text-xs",
            getPointsColor(student.points)
          )}>
            <Trophy className="h-3 w-3 mr-1" />
            {student.points}
          </Badge>
        </div>

        {/* Status Badge - Top Right */}
        <div className="absolute top-2 right-2 z-10">
          <div
            className={cn(
              "text-white border-0 px-1.5 py-0.5 font-bold rounded-full shadow-md inline-flex items-center",
              getStatusColor(student.status)
            )}
            style={{ fontSize: '9px' }}
          >
            {student.status.toUpperCase()}
          </div>
        </div>

        {/* Main Content - Single Column */}
        <div className="h-full flex flex-col">
          {/* Top Section - Student Info */}
          <div className="flex-1 space-y-1 overflow-hidden">
            {/* Student Name as Title */}
            <div className="w-full text-left">
              <h1 className="text-lg font-black text-gray-900 tracking-wide leading-tight truncate text-left">
                {student.name}
              </h1>
            </div>



            {/* Student Information */}
            <div className="space-y-0.5 text-gray-900 overflow-hidden" style={{ fontSize: '12px' }}>
              {/* Very Small Screens (below 320px) - Wrapping Layout */}
              <div className="block min-[320px]:hidden text-left">
                <div className="space-y-0.5 text-left">
                  <div className="text-left">
                    <div className="text-left font-semibold" style={{ fontSize: '12px' }}>ID:</div>
                    <div className="text-left font-mono" style={{ fontSize: '12px' }}>{student.masked_student_id}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-left font-semibold" style={{ fontSize: '12px' }}>DEPARTMENT:</div>
                    <div className="text-left" style={{ fontSize: '12px' }}>{student.department || 'N/A'}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-left font-semibold" style={{ fontSize: '12px' }}>ROLE:</div>
                    <div className="text-left" style={{ fontSize: '12px' }}>{student.role}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-left font-semibold" style={{ fontSize: '12px' }}>LAST SIGN IN:</div>
                    <div className="text-left" style={{ fontSize: '11px' }}>{formatDate(student.last_signed_in_at)}</div>
                  </div>
                </div>
              </div>

              {/* Normal Screens (320px and above) - Aligned Layout */}
              <div className="hidden min-[320px]:block">
                <div className="flex items-center">
                  <span className="w-24 text-left flex-shrink-0 font-semibold" style={{ fontSize: '12px' }}>ID</span>
                  <span style={{ fontSize: '12px' }}>:</span>
                  <span className="text-left ml-1 font-mono" style={{ fontSize: '12px' }}>{student.masked_student_id}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-left flex-shrink-0 font-semibold" style={{ fontSize: '12px' }}>DEPARTMENT</span>
                  <span style={{ fontSize: '12px' }}>:</span>
                  <span className="text-left ml-1" style={{ fontSize: '12px' }}>{student.department || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-left flex-shrink-0 font-semibold" style={{ fontSize: '12px' }}>ROLE</span>
                  <span style={{ fontSize: '12px' }}>:</span>
                  <span className="text-left ml-1" style={{ fontSize: '12px' }}>{student.role}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-left flex-shrink-0 font-semibold" style={{ fontSize: '12px' }}>LAST SIGN IN</span>
                  <span style={{ fontSize: '12px' }}>:</span>
                  <span className="text-left ml-1" style={{ fontSize: '11px' }}>{formatDate(student.last_signed_in_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Action Buttons */}
          <div className="mt-2">
            <div className="flex gap-4">
              <Button
                onClick={onEdit}
                size="sm"
                className="flex-1 bg-gradient-to-r from-[#202072] to-[#e66166] text-white rounded-full font-bold px-4 py-2 shadow-md text-sm h-8 min-h-[36px]"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={onResetPassword}
                size="sm"
                variant="outline"
                className="flex-1 bg-white/90 border border-orange-300 text-orange-600 hover:bg-orange-50 rounded-full font-bold px-4 py-2 shadow-md text-sm h-8 min-h-[36px]"
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};