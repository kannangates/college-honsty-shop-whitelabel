
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getCurrentMessages } from '@/config/dynamic';

interface EnhancedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (error: Error) => void;
  onLoad?: () => void;
  lazy?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

export const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  onError,
  onLoad,
  lazy = true,
  retryCount = 3,
  retryDelay = 1000,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const messages = getCurrentMessages();

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    const errorObj = new Error('Image failed to load');
    
    if (attempts < retryCount) {
      // Retry with delay
      setTimeout(() => {
        setAttempts(prev => prev + 1);
        setCurrentSrc(`${src}?retry=${attempts + 1}`);
      }, retryDelay);
    } else if (fallbackSrc && currentSrc !== fallbackSrc) {
      // Try fallback image
      setCurrentSrc(fallbackSrc);
      setAttempts(0);
    } else {
      // Give up
      setIsLoading(false);
      setHasError(true);
      onError?.(errorObj);
    }
  }, [attempts, retryCount, retryDelay, src, fallbackSrc, currentSrc, onError]);

  useEffect(() => {
    if (src !== currentSrc) {
      setCurrentSrc(src);
      setAttempts(0);
      setHasError(false);
      setIsLoading(true);
    }
  }, [src, currentSrc]);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-500 ${className}`}>
        <span className="text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-sm text-gray-500">{messages.loading?.loading_image || 'Loading image...'}</span>
        </div>
      )}
    </div>
  );
};
