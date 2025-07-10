import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WHITELABEL_CONFIG } from '@/config';

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export const usePerformanceOptimization = () => {
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
  const [loadingStates, setLoadingStates] = useState<Map<string, boolean>>(new Map());

  const getCachedData = useCallback(<T = unknown>(key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now > entry.expiresAt) {
      // Remove expired entry
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      return null;
    }
    
    return entry.data as T;
  }, [cache]);

  const setCachedData = useCallback(<T = unknown>(key: string, data: T, customTTL?: number) => {
    const ttl = customTTL || WHITELABEL_CONFIG.system.performance.cache_timeout;
    const now = Date.now();
    
    setCache(prev => new Map(prev).set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    }));
  }, []);

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => new Map(prev).set(key, loading));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates.get(key) || false;
  }, [loadingStates]);

  const fetchWithCache = useCallback(async <T = unknown>(
    key: string, 
    fetchFn: () => Promise<T>,
    cacheTime: number = WHITELABEL_CONFIG.system.performance.cache_timeout
  ): Promise<T> => {
    const cached = getCachedData<T>(key);
    if (cached) {
      return cached;
    }

    if (isLoading(key)) {
      // Return a promise that waits for the current request to complete
      return new Promise<T>((resolve) => {
        const checkCache = () => {
          const result = getCachedData<T>(key);
          if (result || !isLoading(key)) {
            resolve(result as T);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    setLoading(key, true);
    try {
      const data = await fetchFn();
      setCachedData(key, data, cacheTime);
      return data;
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      throw error;
    } finally {
      setLoading(key, false);
    }
  }, [getCachedData, isLoading, setLoading, setCachedData]);

  // Auto-cleanup expired entries
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setCache(prev => {
        const newCache = new Map();
        prev.forEach((entry, key) => {
          if (now <= entry.expiresAt) {
            newCache.set(key, entry);
          }
        });
        return newCache;
      });
    }, 60000); // Cleanup every minute

    return () => clearInterval(cleanup);
  }, []);

  return {
    fetchWithCache,
    isLoading,
    clearCache: () => setCache(new Map()),
    getCachedData,
    setCachedData,
    cacheSize: cache.size
  };
};
