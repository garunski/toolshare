import { createClient } from "@/common/supabase/server";
import type { Item } from "@/types/categories";

export interface CategoryResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getItemsByCategory(
  categoryId: string,
  limit = 20,
): Promise<CategoryResult<Item[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("category_id", categoryId)
      .eq("is_public", true)
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return {
        success: false,
        error: `Failed to fetch category items: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Get items by category error:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function getToolCategories(): Promise<CategoryResult<string[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("items")
      .select("category_id")
      .not("category_id", "is", null);

    if (error) {
      return {
        success: false,
        error: `Failed to fetch tool categories: ${error.message}`,
      };
    }

    // Get unique category IDs
    const categoryIds = [
      ...new Set(data?.map((item) => item.category_id).filter(Boolean)),
    ];

    return {
      success: true,
      data: categoryIds,
    };
  } catch (error) {
    console.error("Get tool categories error:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}
