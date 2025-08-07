import { CategoryOperations } from "@/common/operations/categoryOperations";
import { createClient } from "@/common/supabase/client";
import type { ItemWithCategory } from "@/types/categories";

export class ItemOwnerOperations {
  /**
   * Get items by owner
   */
  static async getItemsByOwner(ownerId: string): Promise<ItemWithCategory[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("items")
      .select(
        `
        *,
        category:categories(*)
      `,
      )
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch owner items: ${error.message}`);

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

    return itemsWithPaths;
  }

  /**
   * Get items by owner with filters
   */
  static async getItemsByOwnerWithFilters(
    ownerId: string,
    filters: {
      categoryId?: string;
      condition?: string[];
      isAvailable?: boolean;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ data: ItemWithCategory[]; count: number }> {
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
      .eq("owner_id", ownerId);

    // Apply filters
    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    if (filters.condition?.length) {
      query = query.in("condition", filters.condition);
    }

    if (filters.isAvailable !== undefined) {
      query = query.eq("is_available", filters.isAvailable);
    }

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Order by recency
    query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to fetch owner items: ${error.message}`);

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
