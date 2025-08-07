import { createClient } from "@/common/supabase/client";
import type { SocialStats } from "@/types/social";

export class SocialStatsOperations {
  static async getSocialStats(
    userId: string,
  ): Promise<{ success: boolean; data: SocialStats }> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("social_stats")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch social stats: ${error.message}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error("Failed to get social stats:", error);
      return {
        success: false,
        data: {
          total_friends: 0,
          total_loans: 0,
          average_rating: 0,
          trust_score: 0,
        },
      };
    }
  }

  static async getUserStats(
    userId: string,
  ): Promise<{ success: boolean; data: SocialStats }> {
    return this.getSocialStats(userId);
  }

  static async getFriendsOfFriends(
    userId: string,
    limit = 10,
  ): Promise<{ success: boolean; data: any[] }> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", userId)
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch friends of friends: ${error.message}`);
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Failed to get friends of friends:", error);
      return { success: false, data: [] };
    }
  }
}
