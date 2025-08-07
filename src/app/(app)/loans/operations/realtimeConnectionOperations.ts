import { AdminSubscriptionHelpers } from "@/common/operations/helpers/adminSubscriptionHelpers";
import { UserSubscriptionHelpers } from "@/common/operations/helpers/userSubscriptionHelpers";

import { RealtimeConnectionCore } from "./realtimeConnectionCore";
import { RealtimeSubscriptionManager } from "./realtimeSubscriptionManager";

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
    return AdminSubscriptionHelpers.createAdminSubscriptions(callback);
  }

  static subscribeToUserUpdates(
    userId: string,
    callback: (data: any) => void,
  ): () => void {
    return UserSubscriptionHelpers.createUserSubscriptions(userId, callback);
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
