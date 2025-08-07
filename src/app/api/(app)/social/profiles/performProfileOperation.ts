import { PerformFriendRequest } from "@/apiApp/social/friends/request/performFriendRequest";
import type { SocialProfile } from "@/types/social";

export class PerformProfileOperation {
  static async getProfile(
    userId: string,
  ): Promise<{ success: boolean; data: SocialProfile }> {
    try {
      const data = await PerformFriendRequest.getProfile(userId);
      return { success: true, data };
    } catch (error) {
      console.error("Failed to get profile:", error);
      return this.getDefaultProfile(userId);
    }
  }

  private static getDefaultProfile(userId: string): {
    success: boolean;
    data: SocialProfile;
  } {
    return {
      success: false,
      data: {
        id: userId,
        first_name: "Unknown",
        last_name: "User",
        bio: "User bio",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  static async searchUsers(
    query: string,
    currentUserId: string,
    limit = 10,
  ): Promise<{ success: boolean; data: SocialProfile[] }> {
    try {
      const data = await PerformFriendRequest.searchUsers(
        query,
        currentUserId,
        limit,
      );
      return { success: true, data };
    } catch (error) {
      console.error("Failed to search users:", error);
      return { success: false, data: [] };
    }
  }

  static async getSuggestedFriends(
    userId: string,
    limit = 5,
  ): Promise<{ success: boolean; data: SocialProfile[] }> {
    try {
      const data = await PerformFriendRequest.getSuggestedFriends(
        userId,
        limit,
      );
      return { success: true, data };
    } catch (error) {
      console.error("Failed to get suggested friends:", error);
      return { success: false, data: [] };
    }
  }
}
