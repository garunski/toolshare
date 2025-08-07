import { RealtimeConnectionCore } from "./realtimeConnectionCore";

interface SubscriptionConfig {
  table: string;
  event: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  callback: (payload: any) => void;
}

export class RealtimeSubscriptionManager {
  private static subscriptions: Map<string, SubscriptionConfig[]> = new Map();

  static getSubscriptions() {
    return this.subscriptions;
  }

  static async subscribe(
    channelName: string,
    config: SubscriptionConfig,
  ): Promise<() => void> {
    let channel = RealtimeConnectionCore.getChannel(channelName);

    if (!channel) {
      channel = await RealtimeConnectionCore.createChannel(channelName);
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
        RealtimeConnectionCore.handleConnectionStatus(channelName, status);
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
      const channel = RealtimeConnectionCore.getChannel(channelName);
      if (channel) {
        channel.unsubscribe();
        RealtimeConnectionCore.removeChannel(channelName);
        this.subscriptions.delete(channelName);
      }
    }
  }

  static broadcast(channelName: string, event: string, payload: any): void {
    const channel = RealtimeConnectionCore.getChannel(channelName);
    if (channel) {
      channel.send({
        type: "broadcast",
        event,
        payload,
      });
    }
  }

  static clearAllSubscriptions(): void {
    this.subscriptions.clear();
  }
}
