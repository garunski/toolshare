import { CategoryOperations } from "@/common/operations/categoryOperations";
import { createClient } from "@/common/supabase/client";
import type { ItemWithCategory } from "@/types/categories";

export class ItemSearchOperations {
  // Search items with filters
  static async searchItems(filters: {
    search?: string;
    categoryId?: string;
    location?: string;
    condition?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{ data: ItemWithCategory[]; count: number }> {
    const supabase = createClient();

    let query = supabase
      .from("items")
      .select(
        `
        *,
        category:categories(*)
      `,
        { count: "exact" },
      )
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

    if (error) throw new Error(`Failed to search items: ${error.message}`);

    // Add category paths
    const itemsWithPaths = await Promise.all(
      (data || []).map(async (item) => {
        const categoryPath = await CategoryOperations.getCategoryPath(
          item.category_id,
        );
        return {
          ...item,
          category_path: categoryPath,
        };
      }),
    );

    return {
      data: itemsWithPaths,
      count: count || 0,
    };
  }
}
