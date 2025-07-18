
import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

const dotSizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  // Gradient bouncing dots implementation
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="flex gap-1">
        <div className={`${dotSizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]`}></div>
        <div className={`${dotSizeClasses[size]} bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce [animation-delay:-0.15s]`}></div>
        <div className={`${dotSizeClasses[size]} bg-gradient-to-r from-pink-500 to-violet-500 rounded-full animate-bounce`}></div>
      </div>
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  );
};