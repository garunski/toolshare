import { RealtimeConnectionManager } from "@/app/loans/operations/realtimeConnectionOperations";
import { createClient } from "@/common/supabase/client";

interface NotificationPayload {
  id: string;
  type:
    | "loan_request"
    | "loan_approved"
    | "loan_returned"
    | "message_received"
    | "item_requested";
  title: string;
  message: string;
  userId: string;
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export class RealtimeNotifications {
  private static listeners: Map<
    string,
    (notification: NotificationPayload) => void
  > = new Map();

  static async subscribeToNotifications(
    userId: string,
    onNotification: (notification: NotificationPayload) => void,
  ): Promise<() => void> {
    this.listeners.set(userId, onNotification);

    const unsubscribe = await RealtimeConnectionManager.subscribe(
      `notifications-${userId}`,
      {
        table: "notifications",
        event: "INSERT",
        filter: `user_id=eq.${userId}`,
        callback: (payload) => {
          const notification: NotificationPayload = {
            id: payload.new.id,
            type: payload.new.type,
            title: payload.new.title,
            message: payload.new.message,
            userId: payload.new.user_id,
            metadata: payload.new.metadata,
            read: payload.new.read,
            createdAt: payload.new.created_at,
          };

          onNotification(notification);
          this.showBrowserNotification(notification);
        },
      },
    );

    return () => {
      this.listeners.delete(userId);
      unsubscribe();
    };
  }

  static async sendNotification(
    notification: Omit<NotificationPayload, "id" | "read" | "createdAt">,
  ): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("notifications").insert({
      type: notification.type,
      title: notification.title,
      message: notification.message,
      user_id: notification.userId,
      metadata: notification.metadata,
      read: false,
    });

    if (error) {
      console.error("Failed to send notification:", error);
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId);
  }

  private static showBrowserNotification(
    notification: NotificationPayload,
  ): void {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: notification.id,
      });
    }
  }

  static async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
}
