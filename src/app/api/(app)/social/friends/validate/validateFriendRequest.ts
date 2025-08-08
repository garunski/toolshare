import { createClient } from "@/common/supabase/client";
import type { FriendRequestFormData } from "@/types/social";

import { validateFriendRequest } from "../../validation";

export class ValidateFriendRequest {
  static async validateRequest(senderId: string, receiverId: string) {
    const supabase = createClient();
    const [existingRequest, existingConnection] = await Promise.all([
      supabase
        .from("friend_requests")
        .select("*")
        .eq("sender_id", senderId)
        .eq("receiver_id", receiverId)
        .single(),
      supabase
        .from("social_connections")
        .select("*")
        .eq("user_id", senderId)
        .eq("friend_id", receiverId)
        .single(),
    ]);
    if (existingRequest.data) throw new Error("Friend request already exists");
    if (existingConnection.data) throw new Error("Users are already friends");
  }

  static validateFormData(formData: FriendRequestFormData) {
    return validateFriendRequest(formData);
  }
}
