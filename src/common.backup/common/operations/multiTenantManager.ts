// Re-export types and classes from focused tenant management files
export { TenantConfigManager } from "./tenantConfigManager";
export type { TenantConfig } from "./tenantConfigManager";
export { TenantFeatureManager } from "./tenantFeatureManager";
export { TenantLimitsManager } from "./tenantLimitsManager";
export type { LimitCheckResult } from "./tenantLimitsManager";

// Import the classes for use in the facade
import { TenantConfigManager } from "./tenantConfigManager";
import { TenantFeatureManager } from "./tenantFeatureManager";
import { TenantLimitsManager } from "./tenantLimitsManager";

// Facade class for backward compatibility
export class MultiTenantManager {
  /**
   * Get tenant configuration
   */
  static async getTenantConfig(tenantId: string) {
    return TenantConfigManager.getTenantConfig(tenantId);
  }

  /**
   * Check if tenant can perform action
   */
  static async checkTenantLimits(
    tenantId: string,
    action: "add_user" | "add_item" | "upload_file",
    size?: number,
  ) {
    return TenantLimitsManager.checkTenantLimits(tenantId, action, size);
  }

  /**
   * Get tenant features
   */
  static async getTenantFeatures(tenantId: string) {
    return TenantFeatureManager.getTenantFeatures(tenantId);
  }

  /**
   * Check if tenant has specific feature
   */
  static async hasFeature(tenantId: string, feature: string) {
    return TenantFeatureManager.hasFeature(tenantId, feature);
  }
}
