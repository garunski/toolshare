import { createClient } from "@/common/supabase/client";
import type { FriendRequest, FriendRequestFormData } from "@/types/social";

export class GetFriendRequests {
  static async createRequest(
    senderId: string,
    validatedData: FriendRequestFormData,
  ): Promise<FriendRequest> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("friend_requests")
      .insert({
        sender_id: senderId,
        receiver_id: validatedData.receiver_id,
        message: validatedData.message,
      })
      .select("*")
      .single();
    if (error)
      throw new Error(`Failed to send friend request: ${error.message}`);
    return data;
  }

  static async fetchRequests(
    userId: string,
    field: "sender_id" | "receiver_id",
  ) {
    const supabase = createClient();
    const select =
      field === "sender_id"
        ? `*, receiver:profiles!friend_requests_receiver_id_fkey(*)`
        : `*, sender:profiles!friend_requests_sender_id_fkey(*)`;
    return supabase
      .from("friend_requests")
      .select(select)
      .eq(field, userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
  }

  static async cancelRequest(requestId: string, userId: string) {
    const supabase = createClient();
    return supabase
      .from("friend_requests")
      .delete()
      .eq("id", requestId)
      .eq("sender_id", userId);
  }

  static async processResponse(requestId: string, action: "accept" | "reject") {
    const supabase = createClient();
    const rpcName =
      action === "accept" ? "accept_friend_request" : "reject_friend_request";
    return supabase.rpc(rpcName, { request_id: requestId });
  }
}
