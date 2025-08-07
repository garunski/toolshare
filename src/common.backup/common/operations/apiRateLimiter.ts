import {
  DEFAULT_RATE_LIMIT_CONFIG,
  getRateLimitAnalytics,
  trackApiRequest,
} from "./rateLimitHelpers";

interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  limit: number;
}

export class ApiRateLimiter {
  private static readonly userLimits = new Map<string, RateLimitInfo>();
  private static readonly ipLimits = new Map<string, RateLimitInfo>();

  /**
   * Check if request is allowed
   */
  static async checkRateLimit(
    identifier: string,
    type: "user" | "ip" = "user",
    config?: Partial<typeof DEFAULT_RATE_LIMIT_CONFIG>,
  ): Promise<{
    allowed: boolean;
    info: RateLimitInfo;
    retryAfter?: number;
  }> {
    const fullConfig = { ...DEFAULT_RATE_LIMIT_CONFIG, ...config };
    const limitsMap = type === "user" ? this.userLimits : this.ipLimits;
    const now = Date.now();

    // Get or create rate limit info
    let limitInfo = limitsMap.get(identifier);
    if (!limitInfo || now > limitInfo.resetTime) {
      limitInfo = {
        remaining: fullConfig.maxRequests,
        resetTime: now + fullConfig.windowMs,
        limit: fullConfig.maxRequests,
      };
      limitsMap.set(identifier, limitInfo);
    }

    // Check if request is allowed
    const allowed = limitInfo.remaining > 0;
    if (allowed) {
      limitInfo.remaining--;
    }

    // Calculate retry after time
    const retryAfter = allowed ? undefined : limitInfo.resetTime - now;

    return {
      allowed,
      info: { ...limitInfo },
      retryAfter,
    };
  }

  /**
   * Track API request
   */
  static async trackRequest(
    userId?: string,
    ipAddress?: string,
    endpoint?: string,
    method?: string,
    success = true,
  ): Promise<void> {
    await trackApiRequest(userId, ipAddress, endpoint, method, success);
  }

  /**
   * Get rate limit status for user
   */
  static async getRateLimitStatus(
    userId: string,
    type: "user" | "ip" = "user",
  ): Promise<RateLimitInfo | null> {
    const limitsMap = type === "user" ? this.userLimits : this.ipLimits;
    return limitsMap.get(userId) || null;
  }

  /**
   * Reset rate limit for user
   */
  static resetRateLimit(
    identifier: string,
    type: "user" | "ip" = "user",
  ): void {
    const limitsMap = type === "user" ? this.userLimits : this.ipLimits;
    limitsMap.delete(identifier);
  }

  /**
   * Get rate limit analytics
   */
  static async getRateLimitAnalytics(days = 7) {
    return getRateLimitAnalytics(days);
  }

  /**
   * Clean up expired rate limits
   */
  static cleanupExpiredLimits(): void {
    const now = Date.now();

    // Clean user limits
    for (const [identifier, info] of this.userLimits.entries()) {
      if (now > info.resetTime) {
        this.userLimits.delete(identifier);
      }
    }

    // Clean IP limits
    for (const [identifier, info] of this.ipLimits.entries()) {
      if (now > info.resetTime) {
        this.ipLimits.delete(identifier);
      }
    }
  }

  /**
   * Get all active rate limits
   */
  static getActiveLimits(): {
    users: Array<{ identifier: string; info: RateLimitInfo }>;
    ips: Array<{ identifier: string; info: RateLimitInfo }>;
  } {
    const users = Array.from(this.userLimits.entries()).map(
      ([identifier, info]) => ({ identifier, info }),
    );
    const ips = Array.from(this.ipLimits.entries()).map(
      ([identifier, info]) => ({ identifier, info }),
    );

    return { users, ips };
  }
}
