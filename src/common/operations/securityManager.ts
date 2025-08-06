import { createClient } from "@/common/supabase/client";

interface SecurityEvent {
  type:
    | "suspicious_activity"
    | "failed_login"
    | "rate_limit_exceeded"
    | "data_access";
  severity: "low" | "medium" | "high" | "critical";
  details: Record<string, any>;
}

export class SecurityManager {
  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, "") // Remove event handlers
      .trim();
  }

  /**
   * Detect suspicious activity
   */
  static async detectSuspiciousActivity(
    userId: string,
    action: string,
    context: Record<string, any>,
  ): Promise<{
    suspicious: boolean;
    riskScore: number;
    reasons: string[];
  }> {
    const supabase = createClient();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Get recent activity for user
    const { data: recentActivity } = await supabase
      .from("audit_log")
      .select("action, created_at")
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo.toISOString())
      .order("created_at", { ascending: false });

    const activityCount = recentActivity?.length || 0;
    const riskScore = this.calculateRiskScore(action, activityCount, context);
    const reasons: string[] = [];

    // Check for suspicious patterns
    if (activityCount > 100) {
      reasons.push("High activity volume");
    }

    if (action === "failed_login" && activityCount > 5) {
      reasons.push("Multiple failed login attempts");
    }

    if (context.ip && this.isKnownMaliciousIP(context.ip)) {
      reasons.push("Suspicious IP address");
    }

    const suspicious = riskScore > 70 || reasons.length > 0;

    return { suspicious, riskScore, reasons };
  }

  /**
   * Calculate risk score
   */
  private static calculateRiskScore(
    action: string,
    activityCount: number,
    context: Record<string, any>,
  ): number {
    let score = 0;

    // Base score by action type
    switch (action) {
      case "failed_login":
        score += 30;
        break;
      case "data_access":
        score += 20;
        break;
      case "admin_action":
        score += 40;
        break;
    }

    // Activity volume penalty
    if (activityCount > 50) score += 20;
    if (activityCount > 100) score += 30;

    // Time-based penalty (off-hours activity)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) score += 15;

    return Math.min(100, score);
  }

  /**
   * Check if IP is known malicious
   */
  private static isKnownMaliciousIP(ip: string): boolean {
    // This would integrate with a threat intelligence service
    // For now, return false as placeholder
    return false;
  }

  /**
   * Get security headers
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    };
  }
}
