import { createClient } from "@/common/supabase/client";

interface ReportConfig {
  type:
    | "user_activity"
    | "item_usage"
    | "search_analytics"
    | "system_performance";
  timeRange: "day" | "week" | "month" | "quarter";
  filters?: Record<string, any>;
}

export class AnalyticsReportingService {
  /**
   * Generate user activity report
   */
  static async generateUserActivityReport(
    timeRange: "day" | "week" | "month" | "quarter" = "week",
  ): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userEngagement: number;
    topActions: Array<{ action: string; count: number }>;
  }> {
    const supabase = createClient();
    const since = this.getDateFromRange(timeRange);

    const [users, events] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, created_at")
        .gte("created_at", since.toISOString()),
      supabase
        .from("analytics_events")
        .select("event_type, user_id")
        .gte("timestamp", since.toISOString()),
    ]);

    const totalUsers = users.data?.length || 0;
    const uniqueActiveUsers = new Set(
      events.data?.map((e) => e.user_id).filter(Boolean),
    ).size;

    // Count event types
    const actionCounts: Record<string, number> = {};
    events.data?.forEach((event) => {
      actionCounts[event.event_type] =
        (actionCounts[event.event_type] || 0) + 1;
    });

    const topActions = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([action, count]) => ({ action, count }));

    return {
      totalUsers,
      activeUsers: uniqueActiveUsers,
      newUsers: totalUsers,
      userEngagement: totalUsers > 0 ? uniqueActiveUsers / totalUsers : 0,
      topActions,
    };
  }

  /**
   * Generate item usage report
   */
  static async generateItemUsageReport(
    timeRange: "day" | "week" | "month" | "quarter" = "week",
  ): Promise<{
    totalItems: number;
    borrowedItems: number;
    popularCategories: Array<{ category: string; count: number }>;
    itemViews: number;
  }> {
    const supabase = createClient();
    const since = this.getDateFromRange(timeRange);

    const [items, loans, views] = await Promise.all([
      supabase.from("items").select("id, category_id"),
      supabase
        .from("loan_requests")
        .select("item_id, status")
        .eq("status", "approved")
        .gte("created_at", since.toISOString()),
      supabase
        .from("analytics_events")
        .select("properties")
        .eq("event_type", "item_interaction")
        .gte("timestamp", since.toISOString()),
    ]);

    const totalItems = items.data?.length || 0;
    const borrowedItems = loans.data?.length || 0;

    // Count category usage
    const categoryCounts: Record<string, number> = {};
    items.data?.forEach((item) => {
      if (item.category_id) {
        categoryCounts[item.category_id] =
          (categoryCounts[item.category_id] || 0) + 1;
      }
    });

    const popularCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    return {
      totalItems,
      borrowedItems,
      popularCategories,
      itemViews: views.data?.length || 0,
    };
  }

  /**
   * Get date from time range
   */
  private static getDateFromRange(
    range: "day" | "week" | "month" | "quarter",
  ): Date {
    const now = new Date();
    switch (range) {
      case "day":
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case "week":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "month":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "quarter":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }
}
