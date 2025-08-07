import { RealtimeConnectionManager } from "../realtimeConnectionManager";

export class AdminSubscriptionHelpers {
  static createAdminSubscriptions(callback: (data: any) => void): () => void {
    const unsubscribeItems = RealtimeConnectionManager.subscribe(
      "admin-items",
      {
        table: "items",
        event: "*",
        callback: (payload) => callback({ type: "items", payload }),
      },
    );

    const unsubscribeUsers = RealtimeConnectionManager.subscribe(
      "admin-users",
      {
        table: "profiles",
        event: "*",
        callback: (payload) => callback({ type: "users", payload }),
      },
    );

    const unsubscribeCategories = RealtimeConnectionManager.subscribe(
      "admin-categories",
      {
        table: "external_product_taxonomy",
        event: "*",
        callback: (payload) => callback({ type: "categories", payload }),
      },
    );

    const unsubscribeLoans = RealtimeConnectionManager.subscribe(
      "admin-loans",
      {
        table: "loan_requests",
        event: "*",
        callback: (payload) => callback({ type: "loans", payload }),
      },
    );

    return () => {
      unsubscribeItems();
      unsubscribeUsers();
      unsubscribeCategories();
      unsubscribeLoans();
    };
  }
}
