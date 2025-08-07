import { createClient } from "@/common/supabase/server";

export interface TenantConfig {
  id: string;
  name: string;
  subdomain: string;
  features: string[];
  limits: {
    maxUsers: number;
    maxItems: number;
    maxStorage: number; // in MB
  };
  customization: {
    logo?: string;
    primaryColor?: string;
    customDomain?: string;
  };
}

export class TenantConfigManager {
  /**
   * Get tenant configuration
   */
  static async getTenantConfig(tenantId: string): Promise<TenantConfig | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tenant_configs")
      .select("*")
      .eq("id", tenantId)
      .eq("is_active", true)
      .single();

    if (error || !data) return null;

    return {
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
    };
  }

  /**
   * Update tenant configuration
   */
  static async updateTenantConfig(
    tenantId: string,
    config: Partial<TenantConfig>,
  ): Promise<{ success: boolean; error?: string }> {
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
      console.error("Failed to update tenant config:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Manage tenant configuration validation
   */
  static async manageTenantConfig(
    tenantId: string,
    action: "get" | "update",
    config?: Partial<TenantConfig>,
  ) {
    switch (action) {
      case "get":
        return await this.getTenantConfig(tenantId);
      case "update":
        if (!config) throw new Error("Config required for update action");
        return await this.updateTenantConfig(tenantId, config);
      default:
        throw new Error("Invalid action");
    }
  }
}
