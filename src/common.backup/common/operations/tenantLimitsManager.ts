import { createClient } from "@/common/supabase/client";

import { TenantConfig, TenantConfigManager } from "./tenantConfigManager";

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
}

export class TenantLimitsManager {
  /**
   * Check if tenant can perform action
   */
  static async checkTenantLimits(
    tenantId: string,
    action: "add_user" | "add_item" | "upload_file",
    size?: number,
  ): Promise<LimitCheckResult> {
    const config = await TenantConfigManager.getTenantConfig(tenantId);
    if (!config) {
      return {
        allowed: false,
        reason: "Tenant not found",
        current: 0,
        limit: 0,
      };
    }

    const supabase = createClient();

    switch (action) {
      case "add_user":
        return await this.checkUserLimit(supabase, tenantId, config);

      case "add_item":
        return await this.checkItemLimit(supabase, tenantId, config);

      case "upload_file":
        return await this.checkStorageLimit(supabase, tenantId, config, size);

      default:
        return {
          allowed: false,
          reason: "Unknown action",
          current: 0,
          limit: 0,
        };
    }
  }

  private static async checkUserLimit(
    supabase: any,
    tenantId: string,
    config: TenantConfig,
  ): Promise<LimitCheckResult> {
    const { count: userCount } = await supabase
      .from("profiles")
      .select("id", { count: "exact" })
      .eq("tenant_id", tenantId);

    return {
      allowed: (userCount || 0) < config.limits.maxUsers,
      current: userCount || 0,
      limit: config.limits.maxUsers,
      reason:
        (userCount || 0) >= config.limits.maxUsers
          ? "User limit exceeded"
          : undefined,
    };
  }

  private static async checkItemLimit(
    supabase: any,
    tenantId: string,
    config: TenantConfig,
  ): Promise<LimitCheckResult> {
    const { count: itemCount } = await supabase
      .from("items")
      .select("id", { count: "exact" })
      .eq("tenant_id", tenantId);

    return {
      allowed: (itemCount || 0) < config.limits.maxItems,
      current: itemCount || 0,
      limit: config.limits.maxItems,
      reason:
        (itemCount || 0) >= config.limits.maxItems
          ? "Item limit exceeded"
          : undefined,
    };
  }

  private static async checkStorageLimit(
    supabase: any,
    tenantId: string,
    config: TenantConfig,
    size?: number,
  ): Promise<LimitCheckResult> {
    const storageUsage = await this.calculateStorageUsage(supabase, tenantId);
    const fileSize = size || 0;

    return {
      allowed: storageUsage + fileSize <= config.limits.maxStorage,
      current: storageUsage,
      limit: config.limits.maxStorage,
      reason:
        storageUsage + fileSize > config.limits.maxStorage
          ? "Storage limit exceeded"
          : undefined,
    };
  }

  /**
   * Calculate current storage usage for tenant
   */
  private static async calculateStorageUsage(
    supabase: any,
    tenantId: string,
  ): Promise<number> {
    const { data, error } = await supabase
      .from("storage_usage")
      .select("total_size")
      .eq("tenant_id", tenantId)
      .single();

    if (error || !data) return 0;
    return data.total_size || 0;
  }
}
