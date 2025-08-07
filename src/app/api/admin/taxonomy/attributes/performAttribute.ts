import { createClient } from "@/common/supabase/client";
import type { AttributeDefinition } from "@/types/categories";

export class PerformAttribute {
  /**
   * Get attributes for a specific category
   */
  static async manageCategoryAttributes(
    categoryId: string,
  ): Promise<AttributeDefinition[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("category_attributes")
      .select(
        `
        attribute_definitions(*)
      `,
      )
      .eq("category_id", categoryId)
      .order("display_order", { ascending: true });

    if (error)
      throw new Error(`Failed to fetch category attributes: ${error.message}`);

    return data?.map((ca: any) => ca.attribute_definitions) || [];
  }

  /**
   * Assign attribute to category
   */
  static async assignAttributeToCategory(
    categoryId: string,
    attributeId: string,
    isRequired = false,
    displayOrder = 0,
  ): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("category_attributes").insert({
      category_id: categoryId,
      attribute_definition_id: attributeId,
      is_required: isRequired,
      display_order: displayOrder,
    });

    if (error)
      throw new Error(
        `Failed to assign attribute to category: ${error.message}`,
      );
  }

  /**
   * Remove attribute from category
   */
  static async removeAttributeFromCategory(
    categoryId: string,
    attributeId: string,
  ): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("category_attributes")
      .delete()
      .eq("category_id", categoryId)
      .eq("attribute_definition_id", attributeId);

    if (error)
      throw new Error(
        `Failed to remove attribute from category: ${error.message}`,
      );
  }

  /**
   * Update category attribute settings
   */
  static async updateCategoryAttribute(
    categoryId: string,
    attributeId: string,
    updates: { is_required?: boolean; display_order?: number },
  ): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("category_attributes")
      .update(updates)
      .eq("category_id", categoryId)
      .eq("attribute_definition_id", attributeId);

    if (error)
      throw new Error(`Failed to update category attribute: ${error.message}`);
  }
}
