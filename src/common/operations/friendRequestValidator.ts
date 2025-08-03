import { supabase } from "@/common/supabase";
import { friendRequestValidator } from "@/common/validators/socialFeatureValidator";
import type { FriendRequestFormData } from "@/types/social";

export class FriendRequestValidator {
  static async validateRequest(senderId: string, receiverId: string) {
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
    return friendRequestValidator.parse(formData);
  }
}
