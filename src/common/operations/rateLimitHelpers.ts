import { createClient } from "@/common/supabase/client";

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

/**
 * Get rate limit analytics
 */
export async function getRateLimitAnalytics(days = 7): Promise<{
  totalRequests: number;
  blockedRequests: number;
  topUsers: Array<{ userId: string; requests: number }>;
  topIPs: Array<{ ip: string; requests: number }>;
}> {
  const supabase = createClient();
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("api_requests")
    .select("*")
    .gte("created_at", since.toISOString());

  if (error) throw error;

  const requests = data || [];
  const totalRequests = requests.length;
  const blockedRequests = requests.filter((r) => !r.success).length;

  // Group by user
  const userRequests = new Map<string, number>();
  requests.forEach((req) => {
    if (req.user_id) {
      userRequests.set(req.user_id, (userRequests.get(req.user_id) || 0) + 1);
    }
  });

  // Group by IP
  const ipRequests = new Map<string, number>();
  requests.forEach((req) => {
    if (req.ip_address) {
      ipRequests.set(req.ip_address, (ipRequests.get(req.ip_address) || 0) + 1);
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

/**
 * Track API request
 */
export async function trackApiRequest(
  userId?: string,
  ipAddress?: string,
  endpoint?: string,
  method?: string,
  success = true,
): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from("api_requests").insert({
      user_id: userId,
      ip_address: ipAddress,
      endpoint,
      method,
      success,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to track API request:", error);
  }
}
