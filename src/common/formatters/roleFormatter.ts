import type { Permission, Role, UserWithRoles } from "@/types/roles";

export class RoleFormatter {
  /**
   * Format role name for display
   */
  static formatRoleName(role: Role): string {
    return role.name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Format permission name for display
   */
  static formatPermissionName(permission: Permission): string {
    return permission.name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Get role badge color based on role type
   */
  static getRoleBadgeColor(roleName: string): string {
    switch (roleName) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "moderator":
        return "bg-blue-100 text-blue-800";
      case "user":
        return "bg-green-100 text-green-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-purple-100 text-purple-800";
    }
  }

  /**
   * Format user roles summary
   */
  static formatUserRolesSummary(user: UserWithRoles): string {
    if (user.roles.length === 0) return "No roles assigned";
    if (user.roles.length === 1) return this.formatRoleName(user.roles[0]);

    const primary = user.roles.find((r) => r.name === "admin") || user.roles[0];
    const count = user.roles.length;

    return `${this.formatRoleName(primary)} +${count - 1} more`;
  }

  /**
   * Get permission resource and action display
   */
  static formatPermissionDetails(permission: Permission): {
    resource: string;
    action: string;
  } {
    return {
      resource:
        permission.resource.charAt(0).toUpperCase() +
        permission.resource.slice(1),
      action: permission.action.toUpperCase(),
    };
  }

  /**
   * Check if role is system role (cannot be deleted)
   */
  static isSystemRole(role: Role): boolean {
    return (
      role.is_system_role || ["admin", "user", "moderator"].includes(role.name)
    );
  }
}
