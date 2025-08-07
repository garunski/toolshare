import { createClient } from "@/common/supabase/server";
import type { Item } from "@/types/categories";

export interface RecentToolsResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getRecentTools(
  limit = 10,
): Promise<RecentToolsResult<Item[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("is_public", true)
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return {
        success: false,
        error: `Failed to fetch recent tools: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Get recent tools error:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}
