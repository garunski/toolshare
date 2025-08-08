import { createClient } from "@/common/supabase/server";

interface AdminStats {
  totalUsers: number;
  totalItems: number;
  totalCategories: number;
  activeLoans: number;
  recentActivity: any[];
}

export async function getAdminDashboardData(): Promise<AdminStats> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // Check if user has admin role
  const { data: userRole, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleError || userRole?.role !== "admin") {
    throw new Error("Insufficient permissions");
  }

  // Fetch admin statistics
  const [users, items, categories, loans, activity] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact" }),
    supabase.from("items").select("id", { count: "exact" }),
    supabase
      .from("external_product_taxonomy")
      .select("external_id", { count: "exact" }),
    supabase
      .from("loan_requests")
      .select("id", { count: "exact" })
      .eq("status", "active"),
    supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return {
    totalUsers: users.count || 0,
    totalItems: items.count || 0,
    totalCategories: categories.count || 0,
    activeLoans: loans.count || 0,
    recentActivity: activity.data || [],
  };
}
