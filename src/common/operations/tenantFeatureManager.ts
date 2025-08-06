import { TenantConfigManager } from "./tenantConfigManager";

export class TenantFeatureManager {
  /**
   * Get tenant features
   */
  static async getTenantFeatures(tenantId: string): Promise<string[]> {
    const config = await TenantConfigManager.getTenantConfig(tenantId);
    return config?.features || [];
  }

  /**
   * Check if tenant has specific feature
   */
  static async hasFeature(tenantId: string, feature: string): Promise<boolean> {
    const features = await this.getTenantFeatures(tenantId);
    return features.includes(feature);
  }
}
