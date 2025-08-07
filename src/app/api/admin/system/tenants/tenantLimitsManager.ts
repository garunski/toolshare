import { createClient } from "@/common/supabase/server";

export class TenantLimitsManager {
  /**
   * Check tenant limits
   */
  static async checkTenantLimits(
    tenantId: string,
    action: "add_user" | "add_item" | "upload_file",
    size?: number,
  ) {
    const supabase = await createClient();

    try {
      const { data: config, error } = await supabase
        .from("tenant_configs")
        .select("limits")
        .eq("id", tenantId)
        .single();

      if (error || !config) {
        return { success: false, allowed: false, reason: "Tenant not found" };
      }

      const limits = config.limits || {};
      let allowed = true;
      let reason = "";

      switch (action) {
        case "add_user":
          const currentUsers = await this.getCurrentUserCount(tenantId);
          allowed = currentUsers < (limits.maxUsers || 100);
          if (!allowed) reason = "User limit exceeded";
          break;
        case "add_item":
          const currentItems = await this.getCurrentItemCount(tenantId);
          allowed = currentItems < (limits.maxItems || 1000);
          if (!allowed) reason = "Item limit exceeded";
          break;
        case "upload_file":
          const currentStorage = await this.getCurrentStorageUsage(tenantId);
          const fileSize = size || 0;
          allowed = currentStorage + fileSize <= (limits.maxStorage || 1000);
          if (!allowed) reason = "Storage limit exceeded";
          break;
      }

      return { success: true, allowed, reason };
    } catch (error) {
      console.error("Failed to check tenant limits:", error);
      return {
        success: false,
        allowed: false,
        reason: "Error checking limits",
      };
    }
  }

  /**
   * Get current user count for tenant
   */
  private static async getCurrentUserCount(tenantId: string): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId);
    return error ? 0 : count || 0;
  }

  /**
   * Get current item count for tenant
   */
  private static async getCurrentItemCount(tenantId: string): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId);
    return error ? 0 : count || 0;
  }

  /**
   * Get current storage usage for tenant
   */
  private static async getCurrentStorageUsage(
    tenantId: string,
  ): Promise<number> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("storage_usage")
      .select("usage_bytes")
      .eq("tenant_id", tenantId)
      .single();
    if (error || !data) return 0;
    return data.usage_bytes || 0;
  }
}
