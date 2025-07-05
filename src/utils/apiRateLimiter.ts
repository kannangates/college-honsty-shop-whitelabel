
// ISO 27001 - API Rate Limiting and Security
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  blockDuration?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class APIRateLimiter {
  private static instance: APIRateLimiter;
  private requests: Map<string, number[]> = new Map();
  private blockedUntil: Map<string, number> = new Map();
  private violations: Map<string, number> = new Map();
  
  private readonly defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    blockDuration: 5 * 60 * 1000 // 5 minutes
  };

  static getInstance(): APIRateLimiter {
    if (!APIRateLimiter.instance) {
      APIRateLimiter.instance = new APIRateLimiter();
      APIRateLimiter.instance.startCleanupTimer();
    }
    return APIRateLimiter.instance;
  }

  async checkLimit(identifier: string, config: Partial<RateLimitConfig> = {}): Promise<RateLimitResult> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const now = Date.now();

    // Check if currently blocked
    const blockedUntil = this.blockedUntil.get(identifier);
    if (blockedUntil && now < blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: blockedUntil,
        retryAfter: Math.ceil((blockedUntil - now) / 1000)
      };
    }

    // Clean up expired block
    if (blockedUntil && now >= blockedUntil) {
      this.blockedUntil.delete(identifier);
    }

    const windowStart = now - finalConfig.windowMs;

    // Get or create request history for this identifier
    let requestTimes = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    requestTimes = requestTimes.filter(time => time > windowStart);
    
    // Check if limit exceeded
    const allowed = requestTimes.length < finalConfig.maxRequests;
    
    if (allowed) {
      requestTimes.push(now);
      this.requests.set(identifier, requestTimes);
      
      // Reset violation count on successful request
      this.violations.delete(identifier);
    } else {
      // Record violation and potentially block
      const violationCount = (this.violations.get(identifier) || 0) + 1;
      this.violations.set(identifier, violationCount);
      
      // Block after multiple violations
      if (violationCount >= 3) {
        const blockUntil = now + finalConfig.blockDuration!;
        this.blockedUntil.set(identifier, blockUntil);
        console.warn(`Rate limit exceeded - blocking ${identifier} until ${new Date(blockUntil).toISOString()}`);
        
        return {
          allowed: false,
          remaining: 0,
          resetTime: blockUntil,
          retryAfter: Math.ceil(finalConfig.blockDuration! / 1000)
        };
      }
    }

    const remaining = Math.max(0, finalConfig.maxRequests - requestTimes.length);
    const resetTime = requestTimes.length > 0 ? requestTimes[0] + finalConfig.windowMs : now + finalConfig.windowMs;

    return { allowed, remaining, resetTime };
  }

  clearLimits(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier);
      this.blockedUntil.delete(identifier);
      this.violations.delete(identifier);
    } else {
      this.requests.clear();
      this.blockedUntil.clear();
      this.violations.clear();
    }
  }

  getRequestCount(identifier: string): number {
    return this.requests.get(identifier)?.length || 0;
  }

  isBlocked(identifier: string): boolean {
    const blockedUntil = this.blockedUntil.get(identifier);
    return blockedUntil ? Date.now() < blockedUntil : false;
  }

  getViolationCount(identifier: string): number {
    return this.violations.get(identifier) || 0;
  }

  // Advanced rate limiting for different endpoint types
  async checkAPIEndpoint(identifier: string, endpoint: string): Promise<RateLimitResult> {
    const endpointConfigs: Record<string, Partial<RateLimitConfig>> = {
      '/auth/login': { maxRequests: 5, windowMs: 15 * 60 * 1000, blockDuration: 30 * 60 * 1000 },
      '/auth/signup': { maxRequests: 3, windowMs: 60 * 60 * 1000, blockDuration: 60 * 60 * 1000 },
      '/api/products': { maxRequests: 200, windowMs: 15 * 60 * 1000 },
      '/api/orders': { maxRequests: 50, windowMs: 15 * 60 * 1000 },
      default: { maxRequests: 100, windowMs: 15 * 60 * 1000 }
    };

    const config = endpointConfigs[endpoint] || endpointConfigs.default;
    return this.checkLimit(`${identifier}:${endpoint}`, config);
  }

  // Cleanup old entries periodically
  private cleanup(): void {
    const now = Date.now();
    
    // Clean up old requests
    for (const [identifier, requestTimes] of this.requests.entries()) {
      const validRequests = requestTimes.filter(time => now - time < this.defaultConfig.windowMs);
      
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }

    // Clean up expired blocks
    for (const [identifier, blockedUntil] of this.blockedUntil.entries()) {
      if (now >= blockedUntil) {
        this.blockedUntil.delete(identifier);
      }
    }

    // Clean up old violations (reset after 1 hour)
    for (const [identifier, _] of this.violations.entries()) {
      const lastRequest = this.requests.get(identifier);
      if (!lastRequest || lastRequest.length === 0 || now - Math.max(...lastRequest) > 60 * 60 * 1000) {
        this.violations.delete(identifier);
      }
    }
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }

  // Get statistics for monitoring
  getStats(): {
    activeIdentifiers: number;
    blockedIdentifiers: number;
    totalViolations: number;
    memoryUsage: number;
  } {
    return {
      activeIdentifiers: this.requests.size,
      blockedIdentifiers: this.blockedUntil.size,
      totalViolations: Array.from(this.violations.values()).reduce((sum, count) => sum + count, 0),
      memoryUsage: this.requests.size + this.blockedUntil.size + this.violations.size
    };
  }
}

// Auto-cleanup every 5 minutes
setInterval(() => {
  APIRateLimiter.getInstance();
}, 5 * 60 * 1000);
