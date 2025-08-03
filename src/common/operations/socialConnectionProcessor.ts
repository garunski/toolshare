import type { SocialConnection } from "@/types/social";

import { FriendOperations } from "./friendOperations";
import { SocialProfileOperations } from "./socialProfileOperations";
import { SocialStatsProcessor } from "./socialStatsProcessor";

export class SocialConnectionProcessor {
  static async getFriends(
    userId: string,
  ): Promise<{ success: boolean; data: SocialConnection[] }> {
    try {
      const data = await FriendOperations.getFriends(userId);
      return { success: true, data };
    } catch (error) {
      console.error("Failed to get friends:", error);
      return { success: false, data: [] };
    }
  }

  static async removeFriend(
    userId: string,
    friendId: string,
  ): Promise<{ success: boolean }> {
    try {
      await FriendOperations.removeFriend(userId, friendId);
      return { success: true };
    } catch (error) {
      console.error("Failed to remove friend:", error);
      return { success: false };
    }
  }

  static async getSocialStats(
    userId: string,
  ): Promise<{ success: boolean; data: any }> {
    return SocialStatsProcessor.getSocialStats(userId);
  }

  static async searchUsers(
    query: string,
    currentUserId: string,
    limit = 10,
  ): Promise<{ success: boolean; data: any[] }> {
    return SocialProfileOperations.searchUsers(query, currentUserId, limit);
  }

  static async getSuggestedFriends(
    userId: string,
    limit = 5,
  ): Promise<{ success: boolean; data: any[] }> {
    return SocialProfileOperations.getSuggestedFriends(userId, limit);
  }

  static async checkFriendshipStatus(
    userId: string,
    otherUserId: string,
  ): Promise<{
    success: boolean;
    data: "friends" | "pending_sent" | "pending_received" | "none";
  }> {
    try {
      const data = await FriendOperations.checkFriendshipStatus(
        userId,
        otherUserId,
      );
      return { success: true, data };
    } catch (error) {
      console.error("Failed to check friendship status:", error);
      return { success: false, data: "none" };
    }
  }

  static async getFriendsOfFriends(
    userId: string,
    limit = 10,
  ): Promise<{ success: boolean; data: any[] }> {
    return SocialStatsProcessor.getFriendsOfFriends(userId, limit);
  }

  static async sendFriendRequest(
    senderId: string,
    receiverId: string,
  ): Promise<{ success: boolean }> {
    try {
      await FriendOperations.sendFriendRequest(senderId, receiverId);
      return { success: true };
    } catch (error) {
      console.error("Failed to send friend request:", error);
      return { success: false };
    }
  }

  static async getProfile(
    userId: string,
  ): Promise<{ success: boolean; data: any }> {
    return SocialProfileOperations.getProfile(userId);
  }
}
