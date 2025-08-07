import { RealtimeChannel } from "@supabase/supabase-js";

import { AdminSubscriptionHelpers } from "@/common/operations/helpers/adminSubscriptionHelpers";
import { ConnectionManagementHelpers } from "@/common/operations/helpers/connectionManagementHelpers";
import { UserSubscriptionHelpers } from "@/common/operations/helpers/userSubscriptionHelpers";
import { createClient } from "@/common/supabase/client";

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
  private static channels: Map<string, RealtimeChannel> = new Map();
  private static subscriptions: Map<string, SubscriptionConfig[]> = new Map();
  private static connectionStatus: ConnectionStatus = {
    isConnected: false,
    lastHeartbeat: new Date(),
    reconnectAttempts: 0,
  };
  private static reconnectInterval: NodeJS.Timeout | null = null;

  static subscribe(
    channelName: string,
    config: SubscriptionConfig,
  ): () => void {
    let channel = this.channels.get(channelName);

    if (!channel) {
      const supabase = createClient();
      channel = supabase.channel(channelName);
      this.channels.set(channelName, channel);
      this.subscriptions.set(channelName, []);
    }

    const configs = this.subscriptions.get(channelName)!;
    configs.push(config);

    channel.on(
      "postgres_changes" as any,
      {
        event: config.event,
        schema: "public",
        table: config.table,
        filter: config.filter,
      },
      config.callback,
    );

    if (configs.length === 1) {
      channel.subscribe((status) => {
        this.handleConnectionStatus(channelName, status);
      });
    }

    return () => this.unsubscribe(channelName, config);
  }

  static unsubscribe(channelName: string, config: SubscriptionConfig): void {
    const configs = this.subscriptions.get(channelName);
    if (!configs) return;

    const index = configs.indexOf(config);
    if (index > -1) {
      configs.splice(index, 1);
    }

    if (configs.length === 0) {
      const channel = this.channels.get(channelName);
      if (channel) {
        channel.unsubscribe();
        this.channels.delete(channelName);
        this.subscriptions.delete(channelName);
      }
    }
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
    ConnectionManagementHelpers.broadcast(this, channelName, event, payload);
  }

  static getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  private static handleConnectionStatus(
    channelName: string,
    status: string,
  ): void {
    const wasConnected = this.connectionStatus.isConnected;
    this.connectionStatus.isConnected = status === "SUBSCRIBED";
    this.connectionStatus.lastHeartbeat = new Date();

    if (this.connectionStatus.isConnected) {
      this.connectionStatus.reconnectAttempts = 0;
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }
    } else if (wasConnected && !this.connectionStatus.isConnected) {
      ConnectionManagementHelpers.scheduleReconnect(this);
    }
  }

  static closeAllConnections(): void {
    ConnectionManagementHelpers.closeAllConnections(this);
  }

  static getChannels() {
    return this.channels;
  }
  static getSubscriptions() {
    return this.subscriptions;
  }
  static getConnectionStatusInternal() {
    return this.connectionStatus;
  }
  static setConnectionStatus(status: ConnectionStatus) {
    this.connectionStatus = status;
  }
  static getReconnectInterval() {
    return this.reconnectInterval;
  }
  static setReconnectInterval(interval: NodeJS.Timeout | null) {
    this.reconnectInterval = interval;
  }
}
