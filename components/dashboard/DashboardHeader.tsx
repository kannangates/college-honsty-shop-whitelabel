
import React from 'react';

const DashboardHeader = React.memo(() => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
        Student Dashboard
      </h1>
      <p className="text-gray-600">Track your progress and compete with fellow students</p>
    </div>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

export default DashboardHeader;
