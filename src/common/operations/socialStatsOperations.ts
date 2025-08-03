import type { SocialProfile, SocialStats } from "../../types/social";
import { supabase } from "../supabase";

export class SocialStatsOperations {
  static async getSocialStats(userId: string): Promise<SocialStats> {
    const { count: friendCount } = await supabase
      .from("social_connections")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const { data: reputation } = await supabase
      .from("user_reputation")
      .select("*")
      .eq("user_id", userId)
      .single();

    return {
      total_friends: friendCount || 0,
      total_loans: reputation?.total_loans || 0,
      average_rating: reputation?.average_rating || 0,
      trust_score: reputation?.trust_score || 0,
    };
  }

  static async getFriendsOfFriends(
    userId: string,
    limit = 10,
  ): Promise<SocialProfile[]> {
    const { data, error } = await supabase
      .from("social_connections")
      .select(
        `
        friend:profiles!social_connections_friend_id_fkey(
          id,
          first_name,
          last_name,
          bio,
          created_at,
          updated_at
        )
      `,
      )
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to get friends of friends: ${error.message}`);
    }

    const friendIds =
      data?.map((conn) => (conn.friend as any)?.id).filter(Boolean) || [];

    if (friendIds.length === 0) {
      return [];
    }

    const { data: friendsOfFriends, error: fofError } = await supabase
      .from("social_connections")
      .select(
        `
        friend:profiles!social_connections_friend_id_fkey(
          id,
          first_name,
          last_name,
          bio
        )
      `,
      )
      .in("user_id", friendIds)
      .neq("friend_id", userId)
      .limit(limit);

    if (fofError) {
      throw new Error(`Failed to get friends of friends: ${fofError.message}`);
    }

    const uniqueFriends =
      (friendsOfFriends
        ?.map((conn) => conn.friend as any)
        .filter(
          (friend) =>
            friend !== null &&
            !friendIds.includes(friend.id) &&
            friend.id !== userId,
        ) as SocialProfile[]) || [];

    const seen = new Set();
    return uniqueFriends.filter((friend) => {
      if (seen.has(friend.id)) {
        return false;
      }
      seen.add(friend.id);
      return true;
    });
  }
}
