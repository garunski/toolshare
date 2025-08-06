import { CategoryCRUDOperations } from "@/common/operations/categoryCRUDOperations";
import { CategoryTreeBuilder } from "@/common/operations/categoryTreeBuilder";
import { createClient } from "@/common/supabase/client";
import type {
  Category,
  CategoryCreationRequest,
  CategoryTreeNode,
  CategoryUpdateRequest,
  CategoryWithAttributes,
} from "@/types/categories";

export class CategoryOperations {
  // Get all categories with hierarchical structure
  static async getAllCategoriesTree(): Promise<CategoryTreeNode[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw new Error(`Failed to fetch categories: ${error.message}`);

    return CategoryTreeBuilder.buildCategoryTree(data);
  }

  // Get category by ID with attributes
  static async getCategoryWithAttributes(
    categoryId: string,
  ): Promise<CategoryWithAttributes | null> {
    const supabase = createClient();
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
    return CategoryCRUDOperations.createCategory(categoryData);
  }

  // Update existing category
  static async updateCategory(
    updateData: CategoryUpdateRequest,
  ): Promise<Category> {
    return CategoryCRUDOperations.updateCategory(updateData);
  }

  // Delete category (soft delete - mark as inactive)
  static async deleteCategory(categoryId: string): Promise<void> {
    return CategoryCRUDOperations.deleteCategory(categoryId);
  }

  // Get category hierarchy path
  static async getCategoryPath(categoryId: string): Promise<string> {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_category_path", {
      category_uuid: categoryId,
    });

    if (error) throw new Error(`Failed to get category path: ${error.message}`);

    return data || "";
  }
}
