import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '',
  fullScreen = false
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const containerClasses = `
    ${fullScreen ? 'fixed inset-0' : 'w-full h-full'}
    flex items-center justify-center
    ${fullScreen ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50' : 'min-h-[50vh]'}
  `;

  const contentClasses = `
    flex flex-col items-center justify-center 
    gap-4 p-6 rounded-xl
    ${fullScreen ? 'bg-white dark:bg-gray-800 shadow-xl' : ''}
    ${className}
  `;

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        <div className="flex gap-2">
          <div 
            className={`${dotSizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce`}
            style={{ animationDelay: '0s' }}
          />
          <div 
            className={`${dotSizeClasses[size]} bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce`}
            style={{ animationDelay: '0.2s' }}
          />
          <div 
            className={`${dotSizeClasses[size]} bg-gradient-to-r from-pink-500 to-violet-500 rounded-full animate-bounce`}
            style={{ animationDelay: '0.4s' }}
          />
        </div>
        {text && (
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {text}
          </span>
        )}
      </div>
    </div>
  );
};