import { createClient } from "@/common/supabase/server";

export class OfflineDataProcessor {
  /**
   * Sync offline data with server
   */
  static async syncOfflineData(): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    error?: string;
  }> {
    const supabase = await createClient();

    try {
      const { data: pendingItems, error } = await supabase
        .from("offline_storage")
        .select("*")
        .eq("synced", false);

      if (error) throw error;

      let synced = 0;
      let failed = 0;

      for (const item of pendingItems || []) {
        try {
          await this.processOfflineItem(item);
          await this.markItemSynced(item.id);
          synced++;
        } catch (itemError) {
          console.error("Failed to sync item:", itemError);
          failed++;
        }
      }

      return { success: true, synced, failed };
    } catch (error) {
      return {
        success: false,
        synced: 0,
        failed: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Process offline item
   */
  private static async processOfflineItem(item: any): Promise<void> {
    switch (item.type) {
      case "item":
        await this.processItemData(item.data);
        break;
      case "message":
        await this.processMessageData(item.data);
        break;
      case "user_data":
        await this.processUserData(item.data);
        break;
      default:
        throw new Error(`Unknown item type: ${item.type}`);
    }
  }

  /**
   * Mark item as synced
   */
  private static async markItemSynced(itemId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("offline_storage")
      .update({ synced: true })
      .eq("id", itemId);
    if (error) throw error;
  }

  /**
   * Process item data
   */
  private static async processItemData(data: any): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from("items").insert(data);
    if (error) throw error;
  }

  /**
   * Process message data
   */
  private static async processMessageData(data: any): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from("messages").insert(data);
    if (error) throw error;
  }

  /**
   * Process user data
   */
  private static async processUserData(data: any): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").upsert(data);
    if (error) throw error;
  }
}
