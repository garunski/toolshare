import { createClient } from "@/common/supabase/server";
import type { Item } from "@/types/categories";

export interface ItemSearchResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ItemSearchFilters {
  search?: string;
  categoryId?: string;
  location?: string;
  condition?: string[];
  limit?: number;
  offset?: number;
}

export async function performItemSearch(
  filters: ItemSearchFilters,
): Promise<ItemSearchResult<{ data: Item[]; count: number }>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("items")
      .select("*", { count: "exact" })
      .eq("is_public", true)
      .eq("is_available", true);

    // Apply filters
    if (filters.search) {
      query = query.textSearch("search_vector", filters.search);
    }

    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    if (filters.condition?.length) {
      query = query.in("condition", filters.condition);
    }

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Order by relevance and recency
    query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return {
        success: false,
        error: `Failed to search items: ${error.message}`,
      };
    }

    return {
      success: true,
      data: {
        data: data || [],
        count: count || 0,
      },
    };
  } catch (error) {
    console.error("Item search error:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}
