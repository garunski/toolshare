import { OfflineDataProcessor } from "./offlineDataProcessor";
import { OfflineStorageQueries } from "./offlineStorageQueries";

interface OfflineItem {
  id: string;
  type: "item" | "message" | "search" | "user_data";
  data: any;
  timestamp: number;
  synced: boolean;
  userId?: string;
}

export class OfflineStorageOperations {
  /**
   * Manage offline storage operations
   */
  static async manageOfflineStorage(
    action: "store" | "get" | "sync" | "clear" | "stats",
    item?: OfflineItem,
    type?: string,
  ): Promise<any> {
    try {
      switch (action) {
        case "store":
          if (!item) throw new Error("Item required for store action");
          return await OfflineStorageQueries.storeOfflineData(item);
        case "get":
          return await OfflineStorageQueries.getOfflineData(type);
        case "sync":
          return await this.syncOfflineData();
        case "clear":
          return await OfflineStorageQueries.clearOfflineData();
        case "stats":
          return await OfflineStorageQueries.getOfflineStats();
        default:
          throw new Error("Invalid action");
      }
    } catch (error) {
      console.error("Failed to manage offline storage:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Sync offline data with server
   */
  static async syncOfflineData(): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    error?: string;
  }> {
    return OfflineDataProcessor.syncOfflineData();
  }
}
