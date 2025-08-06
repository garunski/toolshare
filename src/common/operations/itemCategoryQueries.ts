import { CategoryOperations } from "@/common/operations/categoryOperations";
import { createClient } from "@/common/supabase/client";
import type { ItemWithCategory } from "@/types/categories";

export class ItemCategoryOperations {
  // Get items by category
  static async getItemsByCategory(
    categoryId: string,
    limit = 20,
  ): Promise<ItemWithCategory[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("items")
      .select(
        `
        *,
        category:categories(*)
      `,
      )
      .eq("category_id", categoryId)
      .eq("is_public", true)
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error)
      throw new Error(`Failed to fetch category items: ${error.message}`);

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
}
