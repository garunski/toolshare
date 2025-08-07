import { createClient } from "@/common/supabase/client";
import { AttributeValidator } from "@/common/validators/attributeValidator";
import type {
  AttributeCreationRequest,
  AttributeDefinition,
  AttributeUpdateRequest,
} from "@/types/categories";

export class PerformAttributeOperations {
  // Get all attribute definitions
  static async manageAttributes(): Promise<AttributeDefinition[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("attribute_definitions")
      .select("*")
      .order("display_order", { ascending: true })
      .order("display_label", { ascending: true });

    if (error) throw new Error(`Failed to fetch attributes: ${error.message}`);

    return data || [];
  }

  // Get attribute definition by ID
  static async getAttributeById(
    attributeId: string,
  ): Promise<AttributeDefinition | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("attribute_definitions")
      .select("*")
      .eq("id", attributeId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch attribute: ${error.message}`);
    }

    return data;
  }

  // Get attributes by data type
  static async getAttributesByType(
    dataType: string,
  ): Promise<AttributeDefinition[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("attribute_definitions")
      .select("*")
      .eq("data_type", dataType)
      .order("display_order", { ascending: true });

    if (error)
      throw new Error(`Failed to fetch attributes by type: ${error.message}`);

    return data || [];
  }

  // Create new attribute definition
  static async createAttribute(
    attributeData: AttributeCreationRequest,
  ): Promise<AttributeDefinition> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("attribute_definitions")
      .insert({
        name: attributeData.name,
        display_label: attributeData.display_label,
        description: attributeData.description,
        data_type: attributeData.data_type,
        is_required: attributeData.is_required || false,
        validation_rules: attributeData.validation_rules || {},
        default_value: attributeData.default_value,
        options: attributeData.options
          ? { options: attributeData.options }
          : null,
        display_order: attributeData.display_order || 0,
        is_searchable: attributeData.is_searchable || false,
        is_filterable: attributeData.is_filterable || false,
        help_text: attributeData.help_text,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create attribute: ${error.message}`);

    return data;
  }

  // Update existing attribute definition
  static async updateAttribute(
    updateData: AttributeUpdateRequest,
  ): Promise<AttributeDefinition> {
    const { id, options, validation_rules, ...updates } = updateData;

    const processedUpdates = {
      ...updates,
      ...(options && { options: { options } }),
      ...(validation_rules && { validation_rules }),
    };

    const supabase = createClient();
    const { data, error } = await supabase
      .from("attribute_definitions")
      .update(processedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update attribute: ${error.message}`);

    return data;
  }

  // Delete attribute definition
  static async deleteAttribute(attributeId: string): Promise<void> {
    const supabase = createClient();
    // Check if attribute is used in category_attributes
    const { data: categoryLinks } = await supabase
      .from("category_attributes")
      .select("id")
      .eq("attribute_definition_id", attributeId);

    if (categoryLinks && categoryLinks.length > 0) {
      throw new Error("Cannot delete attribute that is used by categories");
    }

    const { error } = await supabase
      .from("attribute_definitions")
      .delete()
      .eq("id", attributeId);

    if (error) throw new Error(`Failed to delete attribute: ${error.message}`);
  }

  // Validate attribute value against definition
  static validateAttributeValue(
    value: any,
    attribute: AttributeDefinition,
  ): { isValid: boolean; error?: string } {
    return AttributeValidator.validateAttributeValue(value, attribute);
  }
}
