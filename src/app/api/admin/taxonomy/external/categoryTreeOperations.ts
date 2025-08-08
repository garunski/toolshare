import { createClient } from "@/common/supabase/client";
import type { ExternalTaxonomyNode } from "@/types/categories";

/**
 * Category tree operations for external taxonomy
 */
export class CategoryTreeOperations {
  /**
   * Get category children
   */
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

  /**
   * Get category tree with specified depth
   */
  static async getCategoryTree(
    externalId: number,
    maxDepth: number = 3,
  ): Promise<ExternalTaxonomyNode | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("external_product_taxonomy")
      .select("*")
      .eq("external_id", externalId)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    const rootNode: ExternalTaxonomyNode = {
      external_id: data.external_id,
      category_path: data.category_path,
      parent_id: data.parent_id,
      level: data.level,
      is_active: data.is_active,
      last_updated: data.last_updated,
      children: [],
    };

    if (maxDepth > 0) {
      rootNode.children = await this.getCategoryChildren(data.external_id);

      // Recursively populate children
      for (const child of rootNode.children) {
        child.children = await this.getCategoryTree(
          child.external_id,
          maxDepth - 1,
        ).then((node) => node?.children || []);
      }
    }

    return rootNode;
  }
}
