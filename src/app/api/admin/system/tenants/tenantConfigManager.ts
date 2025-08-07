import { createClient } from "@/common/supabase/server";

import { TenantLimitsManager } from "./tenantLimitsManager";

export class TenantConfigManager {
  /**
   * Handle tenant operations
   */
  static async handleTenantOperations(
    tenantId: string,
    operation: "get_config" | "check_limits" | "get_features" | "has_feature",
    action?: "add_user" | "add_item" | "upload_file",
    feature?: string,
    size?: number,
  ) {
    try {
      switch (operation) {
        case "get_config":
          return await this.getTenantConfig(tenantId);
        case "check_limits":
          if (!action) throw new Error("Action required for limit check");
          return await TenantLimitsManager.checkTenantLimits(
            tenantId,
            action,
            size,
          );
        case "get_features":
          return await this.getTenantFeatures(tenantId);
        case "has_feature":
          if (!feature) throw new Error("Feature required for feature check");
          return await this.hasFeature(tenantId, feature);
        default:
          throw new Error("Invalid operation");
      }
    } catch (error) {
      console.error("Failed to handle tenant operation:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Configure tenant settings
   */
  static async configureTenant(tenantId: string, config: any) {
    const supabase = await createClient();

    try {
      const { error } = await supabase
        .from("tenant_configs")
        .update({
          ...config,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tenantId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Failed to configure tenant:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get tenant configuration
   */
  private static async getTenantConfig(tenantId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tenant_configs")
      .select("*")
      .eq("id", tenantId)
      .eq("is_active", true)
      .single();

    if (error || !data) return { success: false, data: null };

    return {
      success: true,
      data: {
        id: data.id,
        name: data.name,
        subdomain: data.subdomain,
        features: data.features || [],
        limits: data.limits || {
          maxUsers: 100,
          maxItems: 1000,
          maxStorage: 1000,
        },
        customization: data.customization || {},
      },
    };
  }

  /**
   * Get tenant features
   */
  private static async getTenantFeatures(tenantId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tenant_configs")
      .select("features")
      .eq("id", tenantId)
      .single();

    if (error || !data) return { success: false, features: [] };
    return { success: true, features: data.features || [] };
  }

  /**
   * Check if tenant has specific feature
   */
  private static async hasFeature(tenantId: string, feature: string) {
    const result = await this.getTenantFeatures(tenantId);
    if (!result.success) return { success: false, hasFeature: false };
    return {
      success: true,
      hasFeature: result.features.includes(feature),
    };
  }
}
