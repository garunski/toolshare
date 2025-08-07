import { RealtimeConnectionCore } from "./realtimeConnectionCore";
import { RealtimeSubscriptionManager } from "./realtimeSubscriptionManager";

// Temporarily commented out to avoid circular dependencies
// import { SubscriptionHelpers as UserSubscriptionHelpers } from "@/app/api/(app)/profiles/subscriptions/helpers/subscriptionHelpers";
// import { SubscriptionHelpers as AdminSubscriptionHelpers } from "@/app/api/admin/subscriptions/helpers/subscriptionHelpers";

interface SubscriptionConfig {
  table: string;
  event: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  callback: (payload: any) => void;
}

interface ConnectionStatus {
  isConnected: boolean;
  lastHeartbeat: Date;
  reconnectAttempts: number;
}

export class RealtimeConnectionManager {
  static async subscribe(
    channelName: string,
    config: SubscriptionConfig,
  ): Promise<() => void> {
    return RealtimeSubscriptionManager.subscribe(channelName, config);
  }

  static unsubscribe(channelName: string, config: SubscriptionConfig): void {
    RealtimeSubscriptionManager.unsubscribe(channelName, config);
  }

  static subscribeToAdminUpdates(callback: (data: any) => void): () => void {
    // Placeholder implementation to avoid circular dependencies
    console.log("Admin subscription placeholder");
    return () => console.log("Admin subscription cleanup");
  }

  static subscribeToUserUpdates(
    userId: string,
    callback: (data: any) => void,
  ): () => void {
    // Placeholder implementation to avoid circular dependencies
    console.log("User subscription placeholder");
    return () => console.log("User subscription cleanup");
  }

  static broadcast(channelName: string, event: string, payload: any): void {
    RealtimeSubscriptionManager.broadcast(channelName, event, payload);
  }

  static getConnectionStatus(): ConnectionStatus {
    return RealtimeConnectionCore.getConnectionStatus();
  }

  static closeAllConnections(): void {
    RealtimeConnectionCore.closeAllConnections();
    RealtimeSubscriptionManager.clearAllSubscriptions();
  }

  static getChannels() {
    return RealtimeConnectionCore.getChannels();
  }

  static getSubscriptions() {
    return RealtimeSubscriptionManager.getSubscriptions();
  }
}
