import { createClient } from "@/common/supabase/server";

interface SecurityEvent {
  type:
    | "suspicious_activity"
    | "failed_login"
    | "rate_limit_exceeded"
    | "data_access";
  severity: "low" | "medium" | "high" | "critical";
  details: Record<string, any>;
}

export interface SecurityResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SuspiciousActivityResult {
  suspicious: boolean;
  riskScore: number;
  reasons: string[];
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "")
    .trim();
}

export async function detectSuspiciousActivity(
  userId: string,
  action: string,
  context: Record<string, any>,
): Promise<SecurityResult<SuspiciousActivityResult>> {
  try {
    const supabase = await createClient();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const { data: recentActivity } = await supabase
      .from("audit_log")
      .select("action, created_at")
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo.toISOString())
      .order("created_at", { ascending: false });

    const activityCount = recentActivity?.length || 0;
    const riskScore = calculateRiskScore(action, activityCount, context);
    const reasons: string[] = [];

    if (activityCount > 100) {
      reasons.push("High activity volume");
    }

    if (action === "failed_login" && activityCount > 5) {
      reasons.push("Multiple failed login attempts");
    }

    if (context.ip && isKnownMaliciousIP(context.ip)) {
      reasons.push("Suspicious IP address");
    }

    const suspicious = riskScore > 70 || reasons.length > 0;

    return {
      success: true,
      data: { suspicious, riskScore, reasons },
    };
  } catch (error) {
    console.error("Detect suspicious activity error:", error);
    return {
      success: false,
      error: "Failed to detect suspicious activity",
    };
  }
}

export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  };
}

export async function logSecurityEvent(
  event: SecurityEvent,
): Promise<SecurityResult<void>> {
  try {
    const supabase = await createClient();
    await supabase.from("security_events").insert({
      type: event.type,
      severity: event.severity,
      details: event.details,
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Log security event error:", error);
    return {
      success: false,
      error: "Failed to log security event",
    };
  }
}

function calculateRiskScore(
  action: string,
  activityCount: number,
  context: Record<string, any>,
): number {
  let score = 0;

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

  if (activityCount > 50) score += 20;
  if (activityCount > 100) score += 30;

  const hour = new Date().getHours();
  if (hour < 6 || hour > 22) score += 15;

  return Math.min(100, score);
}

function isKnownMaliciousIP(ip: string): boolean {
  return false;
}
