import { OfflineDataHandler } from "./offlineDataHandler";
import { OfflineStorageOperations } from "./offlineStorageOperations";

interface OfflineItem {
  id: string;
  type: "item" | "message" | "search" | "user_data";
  data: any;
  timestamp: number;
  synced: boolean;
  userId?: string;
}

export class OfflineStorageManager {
  /**
   * Manage offline storage operations
   */
  static async manageOfflineStorage(
    action: "store" | "get" | "sync" | "clear" | "stats",
    item?: OfflineItem,
    type?: string,
  ): Promise<any> {
    return OfflineStorageOperations.manageOfflineStorage(action, item, type);
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
    return OfflineStorageOperations.syncOfflineData();
  }

  /**
   * Handle offline data conflicts
   */
  static async handleOfflineData(
    action: "resolve_conflict" | "merge_data" | "validate_data",
    item: OfflineItem,
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    return OfflineDataHandler.handleOfflineData(action, item);
  }
}
