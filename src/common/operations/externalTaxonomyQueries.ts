import { createClient } from "@/common/supabase/client";
import type { ExternalTaxonomyNode } from "@/types/categories";

export class ExternalTaxonomyQueries {
  static async getCategoryById(
    externalId: number,
  ): Promise<ExternalTaxonomyNode | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("external_product_taxonomy")
      .select("*")
      .eq("external_id", externalId)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Not found
      }
      throw new Error(`Failed to fetch external category: ${error.message}`);
    }

    return {
      external_id: data.external_id,
      category_path: data.category_path,
      parent_id: data.parent_id,
      level: data.level,
      is_active: data.is_active,
      last_updated: data.last_updated,
      children: [],
    };
  }

  static async getCategoryChildren(
    parentId: number,
  ): Promise<ExternalTaxonomyNode[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("external_product_taxonomy")
      .select("*")
      .eq("parent_id", parentId)
      .eq("is_active", true)
      .order("category_path", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch category children: ${error.message}`);
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

  static async searchCategories(
    searchTerm: string,
    limit: number = 20,
  ): Promise<ExternalTaxonomyNode[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("external_product_taxonomy")
      .select("*")
      .eq("is_active", true)
      .or(
        `category_path.ilike.%${searchTerm}%,external_id.eq.${parseInt(searchTerm) || 0}`,
      )
      .order("level", { ascending: true })
      .order("category_path", { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search external categories: ${error.message}`);
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

  static async getCategoryStats(): Promise<{
    totalCategories: number;
    levels: Record<number, number>;
    activeCategories: number;
  }> {
    const supabase = createClient();

    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from("external_product_taxonomy")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (totalError) {
      throw new Error(`Failed to get category stats: ${totalError.message}`);
    }

    // Get count by level
    const { data: levelData, error: levelError } = await supabase
      .from("external_product_taxonomy")
      .select("level")
      .eq("is_active", true);

    if (levelError) {
      throw new Error(`Failed to get level stats: ${levelError.message}`);
    }

    const levels: Record<number, number> = {};
    (levelData || []).forEach((item) => {
      levels[item.level] = (levels[item.level] || 0) + 1;
    });

    return {
      totalCategories: totalCount || 0,
      levels,
      activeCategories: totalCount || 0,
    };
  }
}
