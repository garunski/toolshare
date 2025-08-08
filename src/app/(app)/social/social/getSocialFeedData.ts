import { createClient } from "@/common/supabase/server";

export async function getSocialFeedData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get user's friends
  const { data: friends, error: friendsError } = await supabase
    .from("friendships")
    .select(
      `
      friend_id,
      profiles!friendships_friend_id_fkey(
        id,
        first_name,
        last_name,
        avatar_url,
        bio
      )
    `,
    )
    .eq("user_id", user.id)
    .eq("status", "accepted");

  if (friendsError) throw friendsError;

  // Get friend requests
  const { data: friendRequests, error: requestsError } = await supabase
    .from("friend_requests")
    .select(
      `
      id,
      message,
      created_at,
      profiles!friend_requests_sender_id_fkey(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `,
    )
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  if (requestsError) throw requestsError;

  // Get suggested friends (users not in friends list)
  const friendIds = friends?.map((f) => f.friend_id) || [];
  const { data: suggestedFriends, error: suggestedError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      first_name,
      last_name,
      avatar_url,
      bio
    `,
    )
    .neq("id", user.id)
    .not("id", "in", `(${friendIds.length > 0 ? friendIds.join(",") : "null"})`)
    .limit(10);

  if (suggestedError) throw suggestedError;

  // Get recent activity from friends
  const { data: recentActivity, error: activityError } = await supabase
    .from("items")
    .select(
      `
      id,
      name,
      image_url,
      created_at,
      profiles!items_owner_id_fkey(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `,
    )
    .in("owner_id", friendIds)
    .order("created_at", { ascending: false })
    .limit(10);

  if (activityError) throw activityError;

  return {
    friends: friends || [],
    friendRequests: friendRequests || [],
    suggestedFriends: suggestedFriends || [],
    recentActivity: recentActivity || [],
    currentUserId: user.id,
  };
}
