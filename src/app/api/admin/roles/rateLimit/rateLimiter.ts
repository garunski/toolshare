import { createClient } from "@/common/supabase/server";

export class ApiRateLimiterOperations {
  /**
   * Check rate limit for user
   */
  static async checkRateLimit(
    userId: string,
    action: string,
    limit: number = 100,
    windowMs: number = 60000,
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const supabase = await createClient();
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get recent requests for this user and action
    const { data: recentRequests, error } = await supabase
      .from("api_requests")
      .select("created_at")
      .eq("user_id", userId)
      .eq("action", action)
      .gte("created_at", new Date(windowStart).toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Rate limit check failed:", error);
      return { allowed: true, remaining: limit, resetTime: now + windowMs };
    }

    const requestCount = recentRequests?.length || 0;
    const remaining = Math.max(0, limit - requestCount);
    const allowed = requestCount < limit;

    return {
      allowed,
      remaining,
      resetTime: now + windowMs,
    };
  }

  /**
   * Record API request
   */
  static async recordRequest(
    userId: string,
    action: string,
    endpoint: string,
    method: string,
    statusCode: number,
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.from("api_requests").insert({
      user_id: userId,
      action,
      endpoint,
      method,
      status_code: statusCode,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to record API request:", error);
    }
  }

  /**
   * Get rate limit info for user
   */
  static async getRateLimitInfo(
    userId: string,
    action: string,
  ): Promise<{
    totalRequests: number;
    recentRequests: number;
    limit: number;
    windowMs: number;
  }> {
    const supabase = await createClient();
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const windowStart = now - windowMs;

    // Get all requests for this user and action
    const { data: allRequests, error: allError } = await supabase
      .from("api_requests")
      .select("created_at")
      .eq("user_id", userId)
      .eq("action", action);

    // Get recent requests
    const { data: recentRequests, error: recentError } = await supabase
      .from("api_requests")
      .select("created_at")
      .eq("user_id", userId)
      .eq("action", action)
      .gte("created_at", new Date(windowStart).toISOString());

    if (allError || recentError) {
      console.error("Failed to get rate limit info:", allError || recentError);
      return {
        totalRequests: 0,
        recentRequests: 0,
        limit: 100,
        windowMs,
      };
    }

    return {
      totalRequests: allRequests?.length || 0,
      recentRequests: recentRequests?.length || 0,
      limit: 100,
      windowMs,
    };
  }
}
