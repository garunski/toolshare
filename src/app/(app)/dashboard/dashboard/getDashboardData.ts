import { redirect } from "next/navigation";

import { createClient } from "@/common/supabase/server";

interface DashboardData {
  user: {
    id: string;
    email: string;
  };
  isAdmin: boolean;
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
  }

  // Check if user has admin role
  const { data: userRole, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const isAdmin = !roleError && userRole?.role === "admin";

  return {
    user: {
      id: user.id,
      email: user.email || "",
    },
    isAdmin,
  };
}
