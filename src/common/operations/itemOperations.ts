import { CategoryOperations } from "@/common/operations/categoryOperations";
import { createClient } from "@/common/supabase/client";
import type {
  Item,
  ItemCreationRequest,
  ItemUpdateRequest,
  ItemWithCategory,
} from "@/types/categories";

export class ItemOperations {
  // Get item by ID with full details
  static async getItemById(itemId: string): Promise<ItemWithCategory | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("items")
      .select(
        `
        *,
        category:categories(*)
      `,
      )
      .eq("id", itemId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch item: ${error.message}`);
    }

    // Get category path
    const categoryPath = await CategoryOperations.getCategoryPath(
      data.category_id,
    );

    return {
      ...data,
      category_path: categoryPath,
    };
  }

  // Create new item with dynamic attributes
  static async createItem(itemData: ItemCreationRequest): Promise<Item> {
    const supabase = createClient();

    // Validate attributes against category requirements
    const { data: isValid } = await supabase.rpc("validate_item_attributes", {
      category_uuid: itemData.category_id,
      item_attributes: itemData.attributes || {},
    });

    if (!isValid) {
      throw new Error("Item attributes do not meet category requirements");
    }

    const { data, error } = await supabase
      .from("items")
      .insert({
        name: itemData.name,
        description: itemData.description,
        category_id: itemData.category_id,
        condition: itemData.condition,
        attributes: itemData.attributes || {},
        images: itemData.images || [],
        location: itemData.location,
        is_available: itemData.is_available !== false,
        is_shareable: itemData.is_shareable !== false,
        is_public: itemData.is_public !== false,
        tags: itemData.tags || [],
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create item: ${error.message}`);

    return data;
  }

  // Update existing item
  static async updateItem(updateData: ItemUpdateRequest): Promise<Item> {
    const { id, ...updates } = updateData;

    // If attributes or category changed, validate
    if (updates.attributes || updates.category_id) {
      const supabase = createClient();
      const { data: isValid } = await supabase.rpc("validate_item_attributes", {
        category_uuid:
          updates.category_id || (await this.getItemById(id))?.category_id,
        item_attributes: updates.attributes || {},
      });

      if (!isValid) {
        throw new Error("Item attributes do not meet category requirements");
      }
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update item: ${error.message}`);

    return data;
  }

  // Delete item
  static async deleteItem(itemId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("items").delete().eq("id", itemId);

    if (error) throw new Error(`Failed to delete item: ${error.message}`);
  }
}
