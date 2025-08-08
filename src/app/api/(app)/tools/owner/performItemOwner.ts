import { createClient } from "@/common/supabase/server";
import type { ItemWithCategory } from "@/types/categories";

export class PerformItemOwner {
  /**
   * Get items by owner ID
   */
  static async getItemsByOwner(ownerId: string): Promise<ItemWithCategory[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tools")
      .select(
        `
        *,
        categories (
          id,
          name,
          slug,
          description
        )
      `,
      )
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch items by owner: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get owner statistics
   */
  static async getOwnerStats(ownerId: string): Promise<{
    totalItems: number;
    availableItems: number;
    borrowedItems: number;
    totalLoans: number;
  }> {
    const supabase = await createClient();

    // Get total items
    const { count: totalItems } = await supabase
      .from("tools")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", ownerId);

    // Get available items
    const { count: availableItems } = await supabase
      .from("tools")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", ownerId)
      .eq("is_available", true);

    // Get borrowed items
    const { count: borrowedItems } = await supabase
      .from("tools")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", ownerId)
      .eq("is_available", false);

    // Get total loans
    const { count: totalLoans } = await supabase
      .from("loans")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", ownerId);

    return {
      totalItems: totalItems || 0,
      availableItems: availableItems || 0,
      borrowedItems: borrowedItems || 0,
      totalLoans: totalLoans || 0,
    };
  }

  /**
   * Update owner information
   */
  static async updateOwnerInfo(
    ownerId: string,
    updates: {
      first_name?: string;
      last_name?: string;
      phone?: string;
      address?: string;
      bio?: string;
    },
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", ownerId);

    if (error) {
      throw new Error(`Failed to update owner info: ${error.message}`);
    }
  }
}
