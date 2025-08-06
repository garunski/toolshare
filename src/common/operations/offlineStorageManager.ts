interface OfflineItem {
  id: string;
  type: "item" | "message" | "search";
  data: any;
  timestamp: number;
  synced: boolean;
}

export class OfflineStorageManager {
  private static readonly DB_NAME = "ToolShareOffline";
  private static readonly DB_VERSION = 1;
  private static db: IDBDatabase | null = null;

  /**
   * Initialize offline database
   */
  static async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains("items")) {
          const itemStore = db.createObjectStore("items", { keyPath: "id" });
          itemStore.createIndex("type", "type", { unique: false });
          itemStore.createIndex("synced", "synced", { unique: false });
        }
      };
    });
  }

  /**
   * Store item offline
   */
  static async storeItem(item: OfflineItem): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(["items"], "readwrite");
    const store = transaction.objectStore("items");

    const offlineItem: OfflineItem = {
      ...item,
      timestamp: Date.now(),
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const request = store.put(offlineItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get offline items
   */
  static async getOfflineItems(type?: string): Promise<OfflineItem[]> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(["items"], "readonly");
    const store = transaction.objectStore("items");

    return new Promise((resolve, reject) => {
      const request = type ? store.index("type").getAll(type) : store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mark item as synced
   */
  static async markSynced(itemId: string): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(["items"], "readwrite");
    const store = transaction.objectStore("items");

    return new Promise((resolve, reject) => {
      const getRequest = store.get(itemId);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.synced = true;
          const putRequest = store.put(item);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Sync pending items when online
   */
  static async syncPendingItems(): Promise<{ synced: number; failed: number }> {
    const pendingItems = await this.getOfflineItems();
    const unsynced = pendingItems.filter((item) => !item.synced);

    let synced = 0;
    let failed = 0;

    for (const item of unsynced) {
      try {
        if (item.type === "item") {
          await fetch("/api/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.data),
          });
        } else if (item.type === "message") {
          await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.data),
          });
        }
        await this.markSynced(item.id);
        synced++;
      } catch (error) {
        console.error("Failed to sync item:", error);
        failed++;
      }
    }

    return { synced, failed };
  }
}
