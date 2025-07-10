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

  // Preload critical images
  preloadImages(urls: string[]): void {
    urls.forEach(url => {
      const optimizedUrl = this.optimizeImageUrl(url);
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = optimizedUrl;
      document.head.appendChild(link);
    });
  }

  // Get optimized logo URL from config
  getLogoUrl(options?: { width?: number; height?: number }): string {
    return this.optimizeImageUrl(WHITELABEL_CONFIG.branding.logo.url, options);
  }

  // Performance monitoring for images
  trackImagePerformance(url: string): void {
    const img = new Image();
    const startTime = performance.now();
    
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      console.log(`📊 Image loaded in ${loadTime.toFixed(2)}ms: ${url}`);
      
      // Report to performance monitor
      if (loadTime > 2000) {
        console.warn(`⚠️ Slow image load detected: ${loadTime.toFixed(2)}ms`);
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
  }

  // Get cache statistics
  getCacheStats(): { size: number; urls: string[] } {
    return {
      size: this.cache.size,
      urls: Array.from(this.cache.keys())
    };
  }
}
