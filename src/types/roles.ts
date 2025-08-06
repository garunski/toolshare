import { Database } from "./supabase";

export type Role = Database["public"]["Tables"]["roles"]["Row"];
export type Permission = Database["public"]["Tables"]["permissions"]["Row"];
export type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];
export type RolePermission =
  Database["public"]["Tables"]["role_permissions"]["Row"];

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface UserWithRoles {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  roles: Role[];
}

export interface PermissionCheck {
  hasPermission: boolean;
  roles: string[];
  reason?: string;
}

export type RoleAssignmentRequest = {
  userId: string;
  roleId: string;
  expiresAt?: string;
};

export type RoleRemovalRequest = {
  userId: string;
  roleId: string;
};

export type UserCreationRequest = {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  bio?: string;
  roleIds?: string[];
  roleExpiresAt?: string;
};
