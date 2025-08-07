import { createClient } from "@/common/supabase/server";

interface OfflineItem {
  id: string;
  type: "item" | "message" | "search" | "user_data";
  data: any;
  timestamp: number;
  synced: boolean;
  userId?: string;
}

export class OfflineStorageQueries {
  /**
   * Store offline data
   */
  static async storeOfflineData(
    item: OfflineItem,
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const { error } = await supabase.from("offline_storage").insert({
        id: item.id,
        type: item.type,
        data: item.data,
        timestamp: new Date().toISOString(),
        synced: false,
        user_id: item.userId,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get offline data
   */
  static async getOfflineData(
    type?: string,
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const supabase = await createClient();

    try {
      let query = supabase.from("offline_storage").select("*");
      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Clear offline data
   */
  static async clearOfflineData(): Promise<{
    success: boolean;
    error?: string;
  }> {
    const supabase = await createClient();

    try {
      const { error } = await supabase
        .from("offline_storage")
        .delete()
        .eq("synced", true);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get offline storage statistics
   */
  static async getOfflineStats(): Promise<{
    success: boolean;
    stats?: any;
    error?: string;
  }> {
    const supabase = await createClient();

    try {
      const { data, error } = await supabase
        .from("offline_storage")
        .select("type, synced");

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        synced: data?.filter((item: any) => item.synced).length || 0,
        pending: data?.filter((item: any) => !item.synced).length || 0,
        byType: this.groupByType(data || []),
      };

      return { success: true, stats };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Group data by type
   */
  private static groupByType(data: any[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    data.forEach((item) => {
      grouped[item.type] = (grouped[item.type] || 0) + 1;
    });
    return grouped;
  }
}
