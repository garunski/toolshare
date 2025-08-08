import { redirect } from "next/navigation";

import { createClient } from "@/common/supabase/server";
import type { Role, UserWithRoles } from "@/types/roles";

export async function getUsers() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Check admin permissions
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (userRole?.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch users with roles
  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select(
      `
      *,
      user_roles(role, created_at)
    `,
    )
    .order("created_at", { ascending: false });

  if (usersError) throw usersError;

  // Fetch roles
  const { data: roles, error: rolesError } = await supabase
    .from("roles")
    .select("*")
    .order("name");

  if (rolesError) throw rolesError;

  // Get role statistics
  const { data: roleStats } = await supabase
    .from("user_roles")
    .select("role")
    .order("role");

  return {
    users: (users || []) as UserWithRoles[],
    roles: (roles || []) as Role[],
    roleStats: roleStats || [],
  };
}
