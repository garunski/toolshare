import { createClient } from "@/common/supabase/server";

import type { AuditLogEntry } from "./types";

export class AuditQueryOperations {
  /**
   * Get audit logs for user
   */
  static async getAuditLogsForUser(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<AuditLogEntry[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Failed to fetch audit logs:", error);
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get audit logs for resource
   */
  static async getAuditLogsForResource(
    resourceType: string,
    resourceId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<AuditLogEntry[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Failed to fetch audit logs:", error);
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get audit logs by action
   */
  static async getAuditLogsByAction(
    action: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<AuditLogEntry[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("action", action)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Failed to fetch audit logs:", error);
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get audit logs by date range
   */
  static async getAuditLogsByDateRange(
    startDate: Date,
    endDate: Date,
    limit: number = 50,
    offset: number = 0,
  ): Promise<AuditLogEntry[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Failed to fetch audit logs:", error);
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    return data || [];
  }
}
