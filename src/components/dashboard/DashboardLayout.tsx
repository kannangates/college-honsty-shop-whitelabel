
import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="max-w-screen-2xl mx-auto space-y-6">
      {children}
    </div>
  );
};
