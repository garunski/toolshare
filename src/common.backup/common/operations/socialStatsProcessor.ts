import type { SocialStats } from "@/types/social";

import { SocialStatsOperations } from "./socialStatsOperations";

export class SocialStatsProcessor {
  static async getSocialStats(
    userId: string,
  ): Promise<{ success: boolean; data: SocialStats }> {
    try {
      const result = await SocialStatsOperations.getSocialStats(userId);
      return result;
    } catch (error) {
      console.error("Failed to get social stats:", error);
      return this.getDefaultSocialStats();
    }
  }

  private static getDefaultSocialStats(): {
    success: boolean;
    data: SocialStats;
  } {
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

  static async getFriendsOfFriends(
    userId: string,
    limit = 10,
  ): Promise<{ success: boolean; data: any[] }> {
    try {
      const result = await SocialStatsOperations.getFriendsOfFriends(
        userId,
        limit,
      );
      return result;
    } catch (error) {
      console.error("Failed to get friends of friends:", error);
      return { success: false, data: [] };
    }
  }
}
