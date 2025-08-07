import { createClient } from "@/common/supabase/server";

interface NotificationPayload {
  id: string;
  type:
    | "loan_request"
    | "loan_approved"
    | "loan_returned"
    | "message_received"
    | "item_requested"
    | "system_alert"
    | "admin_notification";
  title: string;
  message: string;
  userId: string;
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export class NotificationManager {
  /**
   * Send notification to user
   */
  static async sendNotifications(
    notification: Omit<NotificationPayload, "id" | "read" | "createdAt">,
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const { error } = await supabase.from("notifications").insert({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        user_id: notification.userId,
        metadata: notification.metadata,
        read: false,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Failed to send notification:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Manage notifications (mark as read, delete, etc.)
   */
  static async manageNotifications(
    action: "mark_read" | "delete" | "get_user_notifications",
    notificationId?: string,
    userId?: string,
  ): Promise<any> {
    const supabase = await createClient();

    try {
      switch (action) {
        case "mark_read":
          if (!notificationId) throw new Error("Notification ID required");
          const { error: updateError } = await supabase
            .from("notifications")
            .update({
              read: true,
              read_at: new Date().toISOString(),
            })
            .eq("id", notificationId);
          if (updateError) throw updateError;
          return { success: true };

        case "delete":
          if (!notificationId) throw new Error("Notification ID required");
          const { error: deleteError } = await supabase
            .from("notifications")
            .delete()
            .eq("id", notificationId);
          if (deleteError) throw deleteError;
          return { success: true };

        case "get_user_notifications":
          if (!userId) throw new Error("User ID required");
          const { data: notifications, error: getError } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
          if (getError) throw getError;
          return { success: true, notifications: notifications || [] };

        default:
          throw new Error("Invalid action");
      }
    } catch (error) {
      console.error("Failed to manage notifications:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Broadcast notification to multiple users
   */
  static async broadcastNotification(
    notification: Omit<NotificationPayload, "id" | "read" | "createdAt">,
    userIds: string[],
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    try {
      const notifications = userIds.map((userId) => ({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        user_id: userId,
        metadata: notification.metadata,
        read: false,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("notifications")
        .insert(notifications);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Failed to broadcast notification:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
