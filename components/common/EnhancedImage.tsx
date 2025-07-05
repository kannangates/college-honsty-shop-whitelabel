
import React, { useState, useEffect } from 'react';
import { loadImageWithRetry, CONFIG } from '@/config';

interface EnhancedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadImage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loadedSrc = await loadImageWithRetry(src);
        
        if (mounted) {
          setImageSrc(loadedSrc);
          setLoading(false);
          onLoad?.();
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load image';
          setError(errorMessage);
          setLoading(false);
          
          // Try fallback image
          if (fallbackSrc) {
            setImageSrc(fallbackSrc);
          }
          
          onError?.(err instanceof Error ? err : new Error(errorMessage));
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
  }, [src, fallbackSrc, onLoad, onError]);

  if (loading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <span className="text-gray-500 text-sm">{CONFIG.MESSAGES.LOADING.LOADING_IMAGE}</span>
      </div>
    );
  }

  if (error && !imageSrc) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center border border-gray-300`}>
        <span className="text-gray-500 text-xs text-center p-2">
          Image failed to load
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        // Final fallback
        if (fallbackSrc && imageSrc !== fallbackSrc) {
          setImageSrc(fallbackSrc);
        }
      }}
    />
  );
};
