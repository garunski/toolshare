import { createClient } from "@/common/supabase/client";

export class ItemStatisticsOperations {
  // Get item statistics for admin dashboard
  static async getItemStats(): Promise<{
    total: number;
    by_category: Array<{ category_name: string; count: number }>;
    by_condition: Record<string, number>;
    recent_additions: number;
  }> {
    const supabase = createClient();

    // Get total count
    const { count: total, error: totalError } = await supabase
      .from("items")
      .select("*", { count: "exact", head: true });

    if (totalError) {
      throw new Error(`Failed to get item count: ${totalError.message}`);
    }

    // Get items by category
    const { data: categoryStats, error: categoryError } = await supabase.from(
      "items",
    ).select(`
        category:categories(name)
      `);

    if (categoryError) {
      throw new Error(`Failed to get category stats: ${categoryError.message}`);
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
      throw new Error(
        `Failed to get condition stats: ${conditionError.message}`,
      );
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
      throw new Error(`Failed to get recent additions: ${recentError.message}`);
    }

    return {
      total: total || 0,
      by_category,
      by_condition,
      recent_additions: recent_additions || 0,
    };
  }
}
