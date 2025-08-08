import { createClient } from "@/common/supabase/server";
import type {
  Category,
  CategoryCreationRequest,
  CategoryTreeNode,
  CategoryUpdateRequest,
  CategoryWithAttributes,
} from "@/types/categories";

export class PerformCategoryOperations {
  // Get all categories with hierarchical structure
  static async getAllCategoriesTree(): Promise<CategoryTreeNode[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw new Error(`Failed to fetch categories: ${error.message}`);

    return this.buildCategoryTree(data);
  }

  // Get category by ID with attributes
  static async getCategoryWithAttributes(
    categoryId: string,
  ): Promise<CategoryWithAttributes | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select(
        `
        *,
        category_attributes!inner(
          is_required,
          display_order,
          attribute_definitions(
            id,
            name,
            display_label,
            data_type,
            validation_rules,
            options
          )
        )
      `,
      )
      .eq("id", categoryId)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    return {
      ...data,
      attributes: data.category_attributes
        .map((ca: any) => ({
          id: ca.attribute_definitions.id,
          name: ca.attribute_definitions.name,
          display_label: ca.attribute_definitions.display_label,
          data_type: ca.attribute_definitions.data_type,
          is_required: ca.is_required,
          display_order: ca.display_order,
          validation_rules: ca.attribute_definitions.validation_rules,
          options: ca.attribute_definitions.options,
        }))
        .sort((a: any, b: any) => a.display_order - b.display_order),
    };
  }

  // Create new category
  static async createCategory(
    categoryData: CategoryCreationRequest,
  ): Promise<Category> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .insert(categoryData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create category: ${error.message}`);

    return data;
  }

  // Update existing category
  static async updateCategory(
    updateData: CategoryUpdateRequest,
  ): Promise<Category> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", updateData.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update category: ${error.message}`);

    return data;
  }

  // Delete category (soft delete - mark as inactive)
  static async deleteCategory(categoryId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("categories")
      .update({ is_active: false })
      .eq("id", categoryId);

    if (error) throw new Error(`Failed to delete category: ${error.message}`);
  }

  // Build category tree from flat list
  private static buildCategoryTree(categories: any[]): CategoryTreeNode[] {
    const categoryMap = new Map();
    const roots: CategoryTreeNode[] = [];

    // Create map of all categories
    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Build tree structure
    categories.forEach((category) => {
      const node = categoryMap.get(category.id);
      if (category.parent_id && categoryMap.has(category.parent_id)) {
        const parent = categoryMap.get(category.parent_id);
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
