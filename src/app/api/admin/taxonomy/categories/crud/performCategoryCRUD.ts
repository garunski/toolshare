import { createClient } from "@/common/supabase/client";
import type {
  Category,
  CategoryCreationRequest,
  CategoryUpdateRequest,
} from "@/types/categories";

export class PerformCategoryCRUD {
  /**
   * Create new category
   */
  static async createCategory(
    categoryData: CategoryCreationRequest,
  ): Promise<Category> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        parent_id: categoryData.parent_id,
        icon: categoryData.icon,
        color: categoryData.color,
        sort_order: categoryData.sort_order || 0,
        metadata: categoryData.metadata || {},
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create category: ${error.message}`);

    return data;
  }

  /**
   * Update existing category
   */
  static async updateCategory(
    updateData: CategoryUpdateRequest,
  ): Promise<Category> {
    const { id, ...updates } = updateData;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update category: ${error.message}`);

    return data;
  }

  /**
   * Delete category (soft delete - mark as inactive)
   */
  static async deleteCategory(categoryId: string): Promise<void> {
    const supabase = createClient();
    // Check if category has children
    const { data: children } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", categoryId)
      .eq("is_active", true);

    if (children && children.length > 0) {
      throw new Error("Cannot delete category with child categories");
    }

    // Check if category has items
    const { data: items } = await supabase
      .from("items")
      .select("id")
      .eq("category_id", categoryId);

    if (items && items.length > 0) {
      throw new Error("Cannot delete category with associated items");
    }

    const { error } = await supabase
      .from("categories")
      .update({ is_active: false })
      .eq("id", categoryId);

    if (error) throw new Error(`Failed to delete category: ${error.message}`);
  }
}
