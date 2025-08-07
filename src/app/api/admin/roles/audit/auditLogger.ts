import { createClient } from "@/common/supabase/server";

// Re-export types and query operations
export { AuditQueryOperations } from "./auditQueries";
export type { AuditLogEntry } from "./types";

export class AuditLoggingOperations {
  /**
   * Log audit event
   */
  static async logAuditEvent(
    userId: string,
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from("audit_logs").insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: details ? JSON.stringify(details) : null,
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to log audit event:", error);
      throw new Error(`Audit logging failed: ${error.message}`);
    }
  }

  /**
   * Clean old audit logs
   */
  static async cleanOldAuditLogs(olderThanDays: number = 90): Promise<number> {
    const supabase = await createClient();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // First, count the records that will be deleted
    const { count: recordsToDelete, error: countError } = await supabase
      .from("audit_logs")
      .select("*", { count: "exact", head: true })
      .lt("created_at", cutoffDate.toISOString());

    if (countError) {
      console.error("Failed to count old audit logs:", countError);
      throw new Error(`Failed to count old audit logs: ${countError.message}`);
    }

    // Then delete the records
    const { error: deleteError } = await supabase
      .from("audit_logs")
      .delete()
      .lt("created_at", cutoffDate.toISOString());

    if (deleteError) {
      console.error("Failed to clean old audit logs:", deleteError);
      throw new Error(`Failed to clean old audit logs: ${deleteError.message}`);
    }

    return recordsToDelete || 0;
  }
}
