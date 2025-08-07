import { createClient } from "@/common/supabase/server";

/**
 * Manage real-time connections for admin system
 */
export class ConnectionHelpers {
  /**
   * Handle connection management for admin subscriptions
   */
  static async manageConnections(userId: string) {
    const supabase = await createClient();

    try {
      // Get user's active connections
      const { data: connections, error } = await supabase
        .from("user_connections")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true);

      if (error) throw error;

      return { success: true, connections: connections || [] };
    } catch (error) {
      console.error("Failed to manage connections:", error);
      return { success: false, connections: [] };
    }
  }

  /**
   * Handle connection setup and teardown
   */
  static async handleConnection(
    connectionId: string,
    action: "connect" | "disconnect",
  ) {
    const supabase = await createClient();

    try {
      const { error } = await supabase
        .from("user_connections")
        .update({
          is_active: action === "connect",
          updated_at: new Date().toISOString(),
        })
        .eq("id", connectionId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error(`Failed to ${action} connection:`, error);
      return { success: false };
    }
  }

  /**
   * Get connection statistics
   */
  static async getConnectionStats() {
    const supabase = await createClient();

    try {
      const { data: stats, error } = await supabase
        .from("user_connections")
        .select("is_active")
        .eq("is_active", true);

      if (error) throw error;

      return {
        success: true,
        activeConnections: stats?.length || 0,
      };
    } catch (error) {
      console.error("Failed to get connection stats:", error);
      return { success: false, activeConnections: 0 };
    }
  }
}
