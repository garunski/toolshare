import { createClient } from "@/common/supabase/server";
import type { Item } from "@/types/categories";

export interface OwnerOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface OwnerFilters {
  categoryId?: string;
  condition?: string[];
  isAvailable?: boolean;
  limit?: number;
  offset?: number;
}

export async function getItemsByOwner(
  ownerId: string,
): Promise<OwnerOperationResult<Item[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: `Failed to fetch owner items: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Get items by owner error:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function getItemsByOwnerWithFilters(
  ownerId: string,
  filters: OwnerFilters,
): Promise<OwnerOperationResult<{ data: Item[]; count: number }>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from("items")
      .select("*", { count: "exact" })
      .eq("owner_id", ownerId);

    // Apply filters
    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    if (filters.condition?.length) {
      query = query.in("condition", filters.condition);
    }

    if (filters.isAvailable !== undefined) {
      query = query.eq("is_available", filters.isAvailable);
    }

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Order by recency
    query = query.order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return {
        success: false,
        error: `Failed to fetch owner items: ${error.message}`,
      };
    }

    return {
      success: true,
      data: {
        data: data || [],
        count: count || 0,
      },
    };
  } catch (error) {
    console.error("Get items by owner with filters error:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function updateItemOwner(
  itemId: string,
  newOwnerId: string,
): Promise<OwnerOperationResult<Item>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("items")
      .update({ owner_id: newOwnerId })
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: `Failed to update item owner: ${error.message}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Update item owner error:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}
