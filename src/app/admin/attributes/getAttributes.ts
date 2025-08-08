import { createClient } from "@/common/supabase/server";
import type { AttributeDefinition } from "@/types/categories";

export async function getAttributes(): Promise<AttributeDefinition[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Check admin permissions
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (userRole?.role !== "admin") throw new Error("Insufficient permissions");

  const { data: attributes, error } = await supabase
    .from("attribute_definitions")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return attributes || [];
}
