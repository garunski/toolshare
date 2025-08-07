import { createClient } from "@/common/supabase/server";

export interface ItemStatsResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ItemStatistics {
  total: number;
  by_category: Array<{ category_name: string; count: number }>;
  by_condition: Record<string, number>;
  recent_additions: number;
}

export async function getItemStats(): Promise<ItemStatsResult<ItemStatistics>> {
  try {
    const supabase = await createClient();

    // Get total count
    const { count: total, error: totalError } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true });

    if (totalError) {
      return {
        success: false,
        error: `Failed to get item count: ${totalError.message}`,
      };
    }

    // Get items by category
    const { data: categoryStats, error: categoryError } = await supabase.from(
      "items",
    ).select(`
        category:categories(name)
      `);

    if (categoryError) {
      return {
        success: false,
        error: `Failed to get category stats: ${categoryError.message}`,
      };
    }

    // Count by category
    const categoryCounts = (categoryStats || []).reduce(
      (acc, item) => {
        const categoryName = (item.category as any)?.name || "Uncategorized";
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const by_category = Object.entries(categoryCounts).map(([name, count]) => ({
      category_name: name,
      count,
    }));

    // Get items by condition
    const { data: conditionStats, error: conditionError } = await supabase
      .from("items")
      .select("condition");

    if (conditionError) {
      return {
        success: false,
        error: `Failed to get condition stats: ${conditionError.message}`,
      };
    }

    const by_condition = (conditionStats || []).reduce(
      (acc, item) => {
        acc[item.condition] = (acc[item.condition] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Get recent additions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recent_additions, error: recentError } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo.toISOString());

    if (recentError) {
      return {
        success: false,
        error: `Failed to get recent additions: ${recentError.message}`,
      };
    }

    return {
      success: true,
      data: {
        total: total || 0,
        by_category,
        by_condition,
        recent_additions: recent_additions || 0,
      },
    };
  } catch (error) {
    console.error("Get item stats error:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}
