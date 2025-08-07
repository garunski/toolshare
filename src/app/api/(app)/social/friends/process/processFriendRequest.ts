import { GetFriendRequests } from "@/apiApp/social/friends/list/getFriendRequests";
import { ValidateFriendRequest } from "@/apiApp/social/friends/validate/validateFriendRequest";
import { friendRequestResponseValidator } from "@/common/validators/socialFeatureValidator";
import type { FriendRequest, FriendRequestFormData } from "@/types/social";

export class ProcessFriendRequest {
  static async sendFriendRequest(
    formData: FriendRequestFormData,
    senderId: string,
  ): Promise<{ success: boolean; data: FriendRequest }> {
    try {
      const validatedData = ValidateFriendRequest.validateFormData(formData);
      await ValidateFriendRequest.validateRequest(
        senderId,
        validatedData.receiver_id,
      );
      const data = await GetFriendRequests.createRequest(
        senderId,
        validatedData,
      );
      return { success: true, data };
    } catch (error) {
      console.error("Failed to send friend request:", error);
      return { success: false, data: null as any };
    }
  }

  static async respondToFriendRequest(
    requestId: string,
    action: "accept" | "reject",
    userId: string,
  ): Promise<{ success: boolean }> {
    try {
      friendRequestResponseValidator.parse({ request_id: requestId, action });
      await this.processResponse(requestId, action);
      return { success: true };
    } catch (error) {
      console.error("Failed to respond to friend request:", error);
      return { success: false };
    }
  }

  private static async processResponse(
    requestId: string,
    action: "accept" | "reject",
  ) {
    const { error } = await GetFriendRequests.processResponse(
      requestId,
      action,
    );
    if (error)
      throw new Error(`Failed to ${action} friend request: ${error.message}`);
  }

  static async getPendingRequests(
    userId: string,
  ): Promise<{ success: boolean; data: FriendRequest[] }> {
    try {
      const { data, error } = await GetFriendRequests.fetchRequests(
        userId,
        "receiver_id",
      );
      if (error)
        throw new Error(`Failed to fetch pending requests: ${error.message}`);
      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Failed to get pending requests:", error);
      return { success: false, data: [] };
    }
  }

  static async getSentRequests(
    userId: string,
  ): Promise<{ success: boolean; data: FriendRequest[] }> {
    try {
      const { data, error } = await GetFriendRequests.fetchRequests(
        userId,
        "sender_id",
      );
      if (error)
        throw new Error(`Failed to fetch sent requests: ${error.message}`);
      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Failed to get sent requests:", error);
      return { success: false, data: [] };
    }
  }

  static async cancelFriendRequest(
    requestId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    try {
      const { error } = await GetFriendRequests.cancelRequest(
        requestId,
        userId,
      );
      if (error)
        throw new Error(`Failed to cancel friend request: ${error.message}`);
      return { success: true };
    } catch (error) {
      console.error("Failed to cancel friend request:", error);
      return { success: false };
    }
  }

  static async processRequest(
    requestId: string,
    action: "accept" | "reject",
  ): Promise<{ success: boolean }> {
    return this.respondToFriendRequest(requestId, action, "");
  }
}
