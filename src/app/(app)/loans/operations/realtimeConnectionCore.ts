import { RealtimeChannel } from "@supabase/supabase-js";

import { createClient } from "@/common/supabase/server";

interface ConnectionStatus {
  isConnected: boolean;
  lastHeartbeat: Date;
  reconnectAttempts: number;
}

export class RealtimeConnectionCore {
  private static channels: Map<string, RealtimeChannel> = new Map();
  private static connectionStatus: ConnectionStatus = {
    isConnected: false,
    lastHeartbeat: new Date(),
    reconnectAttempts: 0,
  };
  private static reconnectInterval: NodeJS.Timeout | null = null;

  static getChannels() {
    return this.channels;
  }

  static getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
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

  static async createChannel(channelName: string): Promise<RealtimeChannel> {
    const supabase = await createClient();
    const channel = supabase.channel(channelName);
    this.channels.set(channelName, channel);
    return channel;
  }

  static getChannel(channelName: string): RealtimeChannel | undefined {
    return this.channels.get(channelName);
  }

  static removeChannel(channelName: string): void {
    this.channels.delete(channelName);
  }

  static handleConnectionStatus(channelName: string, status: string): void {
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
      this.scheduleReconnect();
    }
  }

  static closeAllConnections(): void {
    const interval = this.reconnectInterval;
    if (interval) {
      clearInterval(interval);
      this.reconnectInterval = null;
    }

    this.channels.forEach((channel) => channel.unsubscribe());
    this.channels.clear();

    this.setConnectionStatus({
      isConnected: false,
      lastHeartbeat: new Date(),
      reconnectAttempts: 0,
    });
  }

  private static scheduleReconnect(): void {
    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 5000;

    const status = this.getConnectionStatusInternal();

    if (status.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error("Max reconnection attempts reached");
      return;
    }

    const interval = this.getReconnectInterval();
    if (interval) return;

    const newInterval = setTimeout(() => {
      status.reconnectAttempts++;
      this.setConnectionStatus(status);
      this.reconnectAllChannels();
      this.setReconnectInterval(null);
    }, RECONNECT_DELAY);

    this.setReconnectInterval(newInterval);
  }

  private static reconnectAllChannels(): void {
    this.channels.forEach((channel) => {
      channel.subscribe((status) => {
        // This will trigger handleConnectionStatus in the manager
      });
    });
  }
}
