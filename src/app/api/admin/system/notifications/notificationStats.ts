import { createClient } from "@/common/supabase/server";

export class NotificationStats {
  /**
   * Get notification statistics
   */
  static async getNotificationStats(): Promise<{
    success: boolean;
    stats?: { total: number; unread: number; byType: Record<string, number> };
    error?: string;
  }> {
    const supabase = await createClient();

    try {
      const { data: notifications, error } = await supabase
        .from("notifications")
        .select("type, read, created_at");

      if (error) throw error;

      const total = notifications?.length || 0;
      const unread = notifications?.filter((n: any) => !n.read).length || 0;
      const byType: Record<string, number> = {};
      notifications?.forEach((n: any) => {
        byType[n.type] = (byType[n.type] || 0) + 1;
      });

      return {
        success: true,
        stats: { total, unread, byType },
      };
    } catch (error) {
      console.error("Failed to get notification stats:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
