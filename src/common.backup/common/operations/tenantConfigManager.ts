import { createClient } from "@/common/supabase/client";

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
    const supabase = createClient();
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
}
