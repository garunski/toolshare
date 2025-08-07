import { RealtimeConnectionManager } from "@/app/loans/operations/realtimeConnectionClient";

export class ConnectionManagementHelpers {
  static readonly MAX_RECONNECT_ATTEMPTS = 5;
  static readonly RECONNECT_DELAY = 5000;

  static broadcast(
    manager: typeof RealtimeConnectionManager,
    channelName: string,
    event: string,
    payload: any,
  ): void {
    const channel = manager.getChannels().get(channelName);
    if (channel) {
      channel.send({
        type: "broadcast",
        event,
        payload,
      });
    }
  }

  static scheduleReconnect(manager: typeof RealtimeConnectionManager): void {
    const status = manager.getConnectionStatusInternal();

    if (status.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error("Max reconnection attempts reached");
      return;
    }

    const interval = manager.getReconnectInterval();
    if (interval) return;

    const newInterval = setTimeout(() => {
      status.reconnectAttempts++;
      manager.setConnectionStatus(status);
      this.reconnectAllChannels(manager);
      manager.setReconnectInterval(null);
    }, this.RECONNECT_DELAY);

    manager.setReconnectInterval(newInterval);
  }

  static reconnectAllChannels(manager: typeof RealtimeConnectionManager): void {
    const channels = manager.getChannels();
    const subscriptions = manager.getSubscriptions();

    channels.forEach((channel, channelName) => {
      const configs = subscriptions.get(channelName);
      if (configs && configs.length > 0) {
        channel.subscribe((status) => {
          // This will trigger handleConnectionStatus in the manager
        });
      }
    });
  }

  static closeAllConnections(manager: typeof RealtimeConnectionManager): void {
    const interval = manager.getReconnectInterval();
    if (interval) {
      clearInterval(interval);
      manager.setReconnectInterval(null);
    }

    const channels = manager.getChannels();
    const subscriptions = manager.getSubscriptions();

    channels.forEach((channel) => channel.unsubscribe());
    channels.clear();
    subscriptions.clear();

    manager.setConnectionStatus({
      isConnected: false,
      lastHeartbeat: new Date(),
      reconnectAttempts: 0,
    });
  }
}
