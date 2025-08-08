import { z } from "zod";

export const roleAssignmentSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  roleId: z.string().uuid("Invalid role ID format"),
  expiresAt: z.string().datetime().optional(),
});

export const roleRemovalSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  roleId: z.string().uuid("Invalid role ID format"),
});

export const permissionCheckSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  permissionName: z.string().min(1, "Permission name is required"),
});

export const roleCreationSchema = z.object({
  name: z
    .string()
    .min(2, "Role name must be at least 2 characters")
    .max(50, "Role name must be less than 50 characters")
    .regex(/^[a-z_]+$/, "Role name must be lowercase with underscores only"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(200, "Description must be less than 200 characters"),
  isSystemRole: z.boolean().default(false),
});

export const permissionCreationSchema = z.object({
  name: z
    .string()
    .min(2, "Permission name must be at least 2 characters")
    .max(50, "Permission name must be less than 50 characters")
    .regex(
      /^[a-z_]+$/,
      "Permission name must be lowercase with underscores only",
    ),
  resource: z
    .string()
    .min(2, "Resource name must be at least 2 characters")
    .max(30, "Resource name must be less than 30 characters"),
  action: z.enum(["create", "read", "update", "delete", "all"]),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(200, "Description must be less than 200 characters"),
});

// Type inference from schemas
export type RoleAssignmentData = z.infer<typeof roleAssignmentSchema>;
export type RoleRemovalData = z.infer<typeof roleRemovalSchema>;
export type PermissionCheckData = z.infer<typeof permissionCheckSchema>;
export type RoleCreationData = z.infer<typeof roleCreationSchema>;
export type PermissionCreationData = z.infer<typeof permissionCreationSchema>;

/**
 * Validate role assignment request for admin API
 */
export function validateRoleAssignment(data: unknown): RoleAssignmentData {
  return roleAssignmentSchema.parse(data);
}

/**
 * Validate role removal request for admin API
 */
export function validateRoleRemoval(data: unknown): RoleRemovalData {
  return roleRemovalSchema.parse(data);
}

/**
 * Validate permission check request for admin API
 */
export function validatePermissionCheck(data: unknown): PermissionCheckData {
  return permissionCheckSchema.parse(data);
}

/**
 * Validate role creation request for admin API
 */
export function validateRoleCreation(data: unknown): RoleCreationData {
  return roleCreationSchema.parse(data);
}

/**
 * Validate permission creation request for admin API
 */
export function validatePermissionCreation(
  data: unknown,
): PermissionCreationData {
  return permissionCreationSchema.parse(data);
}
