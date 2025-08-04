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
export type RoleAssignmentInput = z.infer<typeof roleAssignmentSchema>;
export type RoleRemovalInput = z.infer<typeof roleRemovalSchema>;
export type PermissionCheckInput = z.infer<typeof permissionCheckSchema>;
export type RoleCreationInput = z.infer<typeof roleCreationSchema>;
export type PermissionCreationInput = z.infer<typeof permissionCreationSchema>;

// Validation helper functions
export class RoleValidator {
  static validateRoleAssignment(data: unknown): RoleAssignmentInput {
    return roleAssignmentSchema.parse(data);
  }

  static validateRoleRemoval(data: unknown): RoleRemovalInput {
    return roleRemovalSchema.parse(data);
  }

  static validatePermissionCheck(data: unknown): PermissionCheckInput {
    return permissionCheckSchema.parse(data);
  }

  static validateRoleCreation(data: unknown): RoleCreationInput {
    return roleCreationSchema.parse(data);
  }

  static validatePermissionCreation(data: unknown): PermissionCreationInput {
    return permissionCreationSchema.parse(data);
  }
}
