import { createClient } from "@/common/supabase/client";

interface AuditLogEntry {
  action: "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "EXPORT";
  resource_type: "item" | "user" | "category" | "loan" | "message";
  resource_id: string;
  user_id: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export class AuditLoggingService {
  /**
   * Log user action
   */
  static async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      const supabase = createClient();
      await supabase.from("audit_log").insert({
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        user_id: entry.user_id,
        metadata: entry.metadata,
        ip_address: entry.ip_address,
        user_agent: entry.user_agent,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to log audit entry:", error);
    }
  }

  /**
   * Get audit trail for resource
   */
  static async getAuditTrail(
    resourceType: string,
    resourceId: string,
    limit = 50,
  ) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("audit_log")
      .select(
        `
        *,
        profiles:user_id (full_name, avatar_url)
      `,
      )
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get user activity summary
   */
  static async getUserActivity(userId: string, days = 30) {
    const supabase = createClient();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from("audit_log")
      .select("action, resource_type, created_at")
      .eq("user_id", userId)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Log item-related actions
   */
  static async logItemAction(
    action: "CREATE" | "UPDATE" | "DELETE" | "VIEW",
    itemId: string,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.logAction({
      action,
      resource_type: "item",
      resource_id: itemId,
      user_id: userId,
      metadata,
    });
  }

  /**
   * Log user-related actions
   */
  static async logUserAction(
    action: "CREATE" | "UPDATE" | "DELETE" | "VIEW",
    targetUserId: string,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.logAction({
      action,
      resource_type: "user",
      resource_id: targetUserId,
      user_id: userId,
      metadata,
    });
  }

  /**
   * Log loan-related actions
   */
  static async logLoanAction(
    action: "CREATE" | "UPDATE" | "DELETE" | "VIEW",
    loanId: string,
    userId: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.logAction({
      action,
      resource_type: "loan",
      resource_id: loanId,
      user_id: userId,
      metadata,
    });
  }
}
