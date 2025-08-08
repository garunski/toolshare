import { notFound } from "next/navigation";

import { createClient } from "@/common/supabase/server";
import type { Message } from "@/types/social";

export async function getConversationData(userId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get the other user's profile
  const { data: otherUser, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (userError || !otherUser) {
    notFound();
  }

  // Check if users are friends or can message
  const { data: friendship } = await supabase
    .from("friendships")
    .select("*")
    .or(
      `and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`,
    )
    .eq("status", "accepted")
    .single();

  if (!friendship) {
    throw new Error("Cannot message this user");
  }

  // Get conversation messages (initial load)
  const { data: messagesData, error: messagesError } = await supabase
    .from("messages")
    .select(
      `
      id,
      content,
      created_at,
      sender_id,
      receiver_id,
      profiles!messages_sender_id_fkey(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `,
    )
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`,
    )
    .order("created_at", { ascending: true })
    .limit(50);

  if (messagesError) throw messagesError;

  // Transform messages to match the Message type
  const messages: Message[] = (messagesData || []).map((msg: any) => ({
    id: msg.id,
    conversation_id: "", // We'll need to add this if needed
    sender_id: msg.sender_id,
    content: msg.content,
    created_at: msg.created_at,
    sender: msg.profiles
      ? {
          id: msg.profiles.id,
          first_name: msg.profiles.first_name,
          last_name: msg.profiles.last_name,
          avatar_url: msg.profiles.avatar_url,
          created_at: msg.created_at,
          updated_at: msg.created_at,
        }
      : undefined,
  }));

  // Mark messages as read
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("receiver_id", user.id)
    .eq("sender_id", userId)
    .is("read_at", null);

  return {
    otherUser,
    messages,
    currentUserId: user.id,
  };
}
