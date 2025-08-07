import { TenantConfigManager } from "./tenantConfigManager";

export class TenantManager {
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
    return TenantConfigManager.handleTenantOperations(
      tenantId,
      operation,
      action,
      feature,
      size,
    );
  }

  /**
   * Configure tenant settings
   */
  static async configureTenant(tenantId: string, config: any) {
    return TenantConfigManager.configureTenant(tenantId, config);
  }
}
