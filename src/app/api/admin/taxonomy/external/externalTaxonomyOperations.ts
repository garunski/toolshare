import { createClient } from "@/common/supabase/client";
import type { ExternalTaxonomyNode } from "@/types/categories";

/**
 * External taxonomy operations for search and stats
 */
export class ExternalTaxonomyOperations {
  /**
   * Search categories
   */
  static async searchCategories(
    searchTerm: string,
    limit: number = 20,
  ): Promise<ExternalTaxonomyNode[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("external_product_taxonomy")
      .select("*")
      .eq("is_active", true)
      .or(`category_path.ilike.%${searchTerm}%`)
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search categories: ${error.message}`);
    }

    return (data || []).map((item) => ({
      external_id: item.external_id,
      category_path: item.category_path,
      parent_id: item.parent_id,
      level: item.level,
      is_active: item.is_active,
      last_updated: item.last_updated,
      children: [],
    }));
  }

  /**
   * Get category statistics
   */
  static async getCategoryStats(): Promise<{
    totalCategories: number;
    levels: Record<number, number>;
    activeCategories: number;
  }> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("external_product_taxonomy")
      .select("level, is_active");

    if (error) {
      throw new Error(`Failed to get category stats: ${error.message}`);
    }

    const levels: Record<number, number> = {};
    let activeCategories = 0;

    (data || []).forEach((item) => {
      levels[item.level] = (levels[item.level] || 0) + 1;
      if (item.is_active) {
        activeCategories++;
      }
    });

    return {
      totalCategories: data?.length || 0,
      levels,
      activeCategories,
    };
  }
}
