import { createClient } from "@/common/supabase/server";
import type { Item, ItemUpdateRequest } from "@/types/categories";

export interface ItemOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function performItemUpdate(
  updateData: ItemUpdateRequest,
): Promise<ItemOperationResult<Item>> {
  try {
    const { id, ...updates } = updateData;
    const supabase = await createClient();

    // If attributes or category changed, validate
    if (updates.attributes || updates.category_id) {
      const { data: isValid } = await supabase.rpc("validate_item_attributes", {
        category_uuid: updates.category_id,
        item_attributes: updates.attributes || {},
      });

      if (!isValid) {
        return {
          success: false,
          error: "Item attributes do not meet category requirements",
        };
      }
    }

    const { data, error } = await supabase
      .from("items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: `Failed to update item: ${error.message}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Item update error:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function getItemById(
  itemId: string,
): Promise<ItemOperationResult<Item>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return {
          success: false,
          error: "Item not found",
        };
      }
      return {
        success: false,
        error: `Failed to fetch item: ${error.message}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Get item error:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function deleteItem(
  itemId: string,
): Promise<ItemOperationResult<void>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("items").delete().eq("id", itemId);

    if (error) {
      return {
        success: false,
        error: `Failed to delete item: ${error.message}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Delete item error:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}
