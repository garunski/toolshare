import type { FriendRequest, FriendRequestFormData } from "../../types/social";
import { supabase } from "../supabase";
import {
  friendRequestResponseValidator,
  friendRequestValidator,
} from "../validators/socialFeatureValidator";

export class FriendRequestProcessor {
  static async sendFriendRequest(
    formData: FriendRequestFormData,
    senderId: string,
  ): Promise<FriendRequest> {
    const validatedData = friendRequestValidator.parse(formData);

    // Check if request already exists
    const existingRequest = await supabase
      .from("friend_requests")
      .select("*")
      .eq("sender_id", senderId)
      .eq("receiver_id", validatedData.receiver_id)
      .single();

    if (existingRequest.data) {
      throw new Error("Friend request already exists");
    }

    // Check if users are already friends
    const existingConnection = await supabase
      .from("social_connections")
      .select("*")
      .eq("user_id", senderId)
      .eq("friend_id", validatedData.receiver_id)
      .single();

    if (existingConnection.data) {
      throw new Error("Users are already friends");
    }

    const { data, error } = await supabase
      .from("friend_requests")
      .insert({
        sender_id: senderId,
        receiver_id: validatedData.receiver_id,
        message: validatedData.message,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to send friend request: ${error.message}`);
    }

    return data;
  }

  static async respondToFriendRequest(
    requestId: string,
    action: "accept" | "reject",
    userId: string,
  ): Promise<void> {
    const validatedData = friendRequestResponseValidator.parse({
      request_id: requestId,
      action,
    });

    if (action === "accept") {
      const { error } = await supabase.rpc("accept_friend_request", {
        request_id: requestId,
      });

      if (error) {
        throw new Error(`Failed to accept friend request: ${error.message}`);
      }
    } else {
      const { error } = await supabase.rpc("reject_friend_request", {
        request_id: requestId,
      });

      if (error) {
        throw new Error(`Failed to reject friend request: ${error.message}`);
      }
    }
  }

  static async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    const { data, error } = await supabase
      .from("friend_requests")
      .select(
        `
        *,
        sender:profiles!friend_requests_sender_id_fkey(*)
      `,
      )
      .eq("receiver_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch pending requests: ${error.message}`);
    }

    return data || [];
  }

  static async getSentRequests(userId: string): Promise<FriendRequest[]> {
    const { data, error } = await supabase
      .from("friend_requests")
      .select(
        `
        *,
        receiver:profiles!friend_requests_receiver_id_fkey(*)
      `,
      )
      .eq("sender_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch sent requests: ${error.message}`);
    }

    return data || [];
  }

  static async cancelFriendRequest(
    requestId: string,
    userId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("friend_requests")
      .delete()
      .eq("id", requestId)
      .eq("sender_id", userId)
      .eq("status", "pending");

    if (error) {
      throw new Error(`Failed to cancel friend request: ${error.message}`);
    }
  }
}
