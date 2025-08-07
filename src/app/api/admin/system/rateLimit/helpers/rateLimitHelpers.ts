import { createClient } from "@/common/supabase/server";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  limit: number;
}

export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

export class RateLimitHelpers {
  /**
   * Check rate limit for user or IP
   */
  static async checkRateLimit(
    identifier: string,
    config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG,
  ): Promise<RateLimitInfo> {
    const supabase = await createClient();
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      const { data: requests, error } = await supabase
        .from("api_requests")
        .select("created_at")
        .eq("identifier", identifier)
        .gte("created_at", new Date(windowStart).toISOString());

      if (error) throw error;

      const requestCount = requests?.length || 0;
      const remaining = Math.max(0, config.maxRequests - requestCount);
      const resetTime = now + config.windowMs;

      return {
        remaining,
        resetTime,
        limit: config.maxRequests,
      };
    } catch (error) {
      console.error("Failed to check rate limit:", error);
      return {
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        limit: config.maxRequests,
      };
    }
  }

  /**
   * Update rate limit for user or IP
   */
  static async updateRateLimit(
    identifier: string,
    endpoint: string,
    method: string,
    success: boolean = true,
  ): Promise<void> {
    try {
      const supabase = await createClient();
      await supabase.from("api_requests").insert({
        identifier,
        endpoint,
        method,
        success,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to update rate limit:", error);
    }
  }

  /**
   * Get rate limit analytics
   */
  static async getRateLimitAnalytics(days = 7): Promise<{
    totalRequests: number;
    blockedRequests: number;
    topUsers: Array<{ userId: string; requests: number }>;
    topIPs: Array<{ ip: string; requests: number }>;
  }> {
    const supabase = await createClient();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from("api_requests")
      .select("*")
      .gte("created_at", since.toISOString());

    if (error) throw error;

    const requests = data || [];
    const totalRequests = requests.length;
    const blockedRequests = requests.filter((r: any) => !r.success).length;

    const userRequests = new Map<string, number>();
    requests.forEach((req: any) => {
      if (req.user_id) {
        userRequests.set(req.user_id, (userRequests.get(req.user_id) || 0) + 1);
      }
    });

    const ipRequests = new Map<string, number>();
    requests.forEach((req: any) => {
      if (req.ip_address) {
        ipRequests.set(
          req.ip_address,
          (ipRequests.get(req.ip_address) || 0) + 1,
        );
      }
    });

    const topUsers = Array.from(userRequests.entries())
      .map(([userId, requests]) => ({ userId, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    const topIPs = Array.from(ipRequests.entries())
      .map(([ip, requests]) => ({ ip, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    return {
      totalRequests,
      blockedRequests,
      topUsers,
      topIPs,
    };
  }
}
