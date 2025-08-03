import type {
  SocialConnection,
  SocialProfile,
  SocialStats,
} from "../../types/social";

import { FriendOperations } from "./friendOperations";
import { SocialStatsOperations } from "./socialStatsOperations";

export class SocialConnectionProcessor {
  static async getFriends(userId: string): Promise<SocialConnection[]> {
    return FriendOperations.getFriends(userId);
  }

  static async removeFriend(userId: string, friendId: string): Promise<void> {
    return FriendOperations.removeFriend(userId, friendId);
  }

  static async getSocialStats(userId: string): Promise<SocialStats> {
    return SocialStatsOperations.getSocialStats(userId);
  }

  static async searchUsers(
    query: string,
    currentUserId: string,
    limit = 10,
  ): Promise<SocialProfile[]> {
    return FriendOperations.searchUsers(query, currentUserId, limit);
  }

  static async getSuggestedFriends(
    userId: string,
    limit = 5,
  ): Promise<SocialProfile[]> {
    return FriendOperations.getSuggestedFriends(userId, limit);
  }

  static async checkFriendshipStatus(
    userId: string,
    otherUserId: string,
  ): Promise<"friends" | "pending_sent" | "pending_received" | "none"> {
    return FriendOperations.checkFriendshipStatus(userId, otherUserId);
  }

  static async getFriendsOfFriends(
    userId: string,
    limit = 10,
  ): Promise<SocialProfile[]> {
    return SocialStatsOperations.getFriendsOfFriends(userId, limit);
  }
}
