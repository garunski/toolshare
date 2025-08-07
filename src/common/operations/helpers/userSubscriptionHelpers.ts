import { RealtimeConnectionManager } from "@/app/loans/operations/realtimeConnectionClient";

export class UserSubscriptionHelpers {
  static createUserSubscriptions(
    userId: string,
    callback: (data: any) => void,
  ): () => void {
    const unsubscribeItems = RealtimeConnectionManager.subscribe(
      `user-items-${userId}`,
      {
        table: "items",
        event: "*",
        filter: `owner_id=eq.${userId}`,
        callback: (payload) => callback({ type: "my-items", payload }),
      },
    );

    const unsubscribeRequests = RealtimeConnectionManager.subscribe(
      `user-requests-${userId}`,
      {
        table: "loan_requests",
        event: "*",
        filter: `borrower_id=eq.${userId}`,
        callback: (payload) => callback({ type: "loan-requests", payload }),
      },
    );

    const unsubscribeMessages = RealtimeConnectionManager.subscribe(
      `user-messages-${userId}`,
      {
        table: "messages",
        event: "*",
        filter: `recipient_id=eq.${userId}`,
        callback: (payload) => callback({ type: "messages", payload }),
      },
    );

    return () => {
      unsubscribeItems();
      unsubscribeRequests();
      unsubscribeMessages();
    };
  }
}
