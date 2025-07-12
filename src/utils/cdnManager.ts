// CDN Manager for Images using jsDelivr
import { WHITELABEL_CONFIG } from '@/config';

export interface CDNConfig {
  provider: 'jsdelivr' | 'local';
  baseUrl: string;
  cacheHeaders: Record<string, string>;
  optimizations: {
    webp: boolean;
    compression: boolean;
    resizing: boolean;
  };
}

export class CDNManager {
  private static instance: CDNManager;
  private cache = new Map<string, string>();
  private performanceCache = new Map<string, number>();
  
  private readonly config: CDNConfig = {
    provider: 'jsdelivr',
    baseUrl: 'https://cdn.jsdelivr.net',
    cacheHeaders: {
      'Cache-Control': 'public, max-age=31536000',
      'Expires': new Date(Date.now() + 31536000 * 1000).toUTCString()
    },
    optimizations: {
      webp: true,
      compression: true,
      resizing: false // jsDelivr doesn't support dynamic resizing
    }
  };

  static getInstance(): CDNManager {
    if (!CDNManager.instance) {
      CDNManager.instance = new CDNManager();
    }
    return CDNManager.instance;
  }

  // Get optimized image URL from jsDelivr or local
  optimizeImageUrl(url: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  }): string {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // For local files, return as-is
    if (url.startsWith('/') || url.startsWith('./')) {
      this.cache.set(url, url);
      return url;
    }

    // For jsDelivr CDN, ensure proper format
    if (url.includes('cdn.jsdelivr.net')) {
      this.cache.set(url, url);
      return url;
    }

    // Default to original URL if not handled
    this.cache.set(url, url);
    return url;
  }

  // Preload critical images with better error handling
  preloadImages(urls: string[]): void {
    urls.forEach(url => {
      try {
        const optimizedUrl = this.optimizeImageUrl(url);
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = optimizedUrl;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      } catch (error) {
        console.warn(`⚠️ Failed to preload image: ${url}`, error);
      }
    });
  }

  // Get optimized logo URL from config
  getLogoUrl(options?: { width?: number; height?: number }): string {
    return this.optimizeImageUrl(WHITELABEL_CONFIG.branding.logo.url, options);
  }

  // Performance monitoring for images - only track in development
  trackImagePerformance(url: string): void {
    // Only track in development to reduce console noise
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Skip if already tracked
    if (this.performanceCache.has(url)) {
      return;
    }

    const img = new Image();
    const startTime = performance.now();
    
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      this.performanceCache.set(url, loadTime);
      
      // Only log if it's actually slow (>3 seconds)
      if (loadTime > 3000) {
        console.warn(`⚠️ Slow image load detected: ${loadTime.toFixed(2)}ms for ${url}`);
      }
    };
    
    img.onerror = () => {
      console.error(`❌ Failed to load image: ${url}`);
    };
    
    img.src = this.optimizeImageUrl(url);
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
    this.performanceCache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; urls: string[]; performanceCount: number } {
    return {
      size: this.cache.size,
      urls: Array.from(this.cache.keys()),
      performanceCount: this.performanceCache.size
    };
  }
}
