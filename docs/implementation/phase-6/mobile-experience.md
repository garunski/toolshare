# Mobile Experience Enhancement

## Progressive Web App and Mobile Optimization

### 1. PWA Service Worker
- [ ] Create: `public/sw.js` (under 150 lines)

```javascript
// public/sw.js
const CACHE_NAME = 'toolshare-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-items') {
    event.waitUntil(syncItems());
  }
});

async function syncItems() {
  // Sync pending item uploads when back online
  const pendingItems = await getStoredItems();
  for (const item of pendingItems) {
    try {
      await uploadItem(item);
      await removeStoredItem(item.id);
    } catch (error) {
      console.error('Failed to sync item:', error);
    }
  }
}
```

### 2. Mobile Optimization Hook
- [ ] Create: `src/common/hooks/useMobileOptimization.ts` (under 150 lines)

```typescript
// src/common/hooks/useMobileOptimization.ts
import { useState, useEffect } from 'react';

interface MobileInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  orientation: 'portrait' | 'landscape';
  touchDevice: boolean;
}

export function useMobileOptimization(): MobileInfo {
  const [mobileInfo, setMobileInfo] = useState<MobileInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenSize: 'lg',
    orientation: 'landscape',
    touchDevice: false
  });

  useEffect(() => {
    const updateMobileInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      
      let screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'lg';
      if (width < 480) screenSize = 'xs';
      else if (width < 768) screenSize = 'sm';
      else if (width < 1024) screenSize = 'md';
      else if (width < 1280) screenSize = 'lg';
      else screenSize = 'xl';

      const orientation = height > width ? 'portrait' : 'landscape';
      const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      setMobileInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenSize,
        orientation,
        touchDevice
      });
    };

    updateMobileInfo();
    window.addEventListener('resize', updateMobileInfo);
    window.addEventListener('orientationchange', updateMobileInfo);

    return () => {
      window.removeEventListener('resize', updateMobileInfo);
      window.removeEventListener('orientationchange', updateMobileInfo);
    };
  }, []);

  return mobileInfo;
}

/**
 * Hook for touch gestures
 */
export function useTouchGestures(element: React.RefObject<HTMLElement>) {
  const [gestures, setGestures] = useState({
    swipeLeft: false,
    swipeRight: false,
    swipeUp: false,
    swipeDown: false,
    pinch: false
  });

  useEffect(() => {
    const el = element.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let startDistance = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        startDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        const minSwipeDistance = 50;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            setGestures(prev => ({ ...prev, swipeRight: true }));
            setTimeout(() => setGestures(prev => ({ ...prev, swipeRight: false })), 100);
          } else {
            setGestures(prev => ({ ...prev, swipeLeft: true }));
            setTimeout(() => setGestures(prev => ({ ...prev, swipeLeft: false })), 100);
          }
        } else if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0) {
            setGestures(prev => ({ ...prev, swipeDown: true }));
            setTimeout(() => setGestures(prev => ({ ...prev, swipeDown: false })), 100);
          } else {
            setGestures(prev => ({ ...prev, swipeUp: true }));
            setTimeout(() => setGestures(prev => ({ ...prev, swipeUp: false })), 100);
          }
        }
      }
    };

    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [element]);

  return gestures;
}
```

### 3. Offline Storage Manager
- [ ] Create: `src/common/operations/offlineStorageManager.ts` (under 150 lines)

```typescript
// src/common/operations/offlineStorageManager.ts

interface OfflineItem {
  id: string;
  type: 'item' | 'message' | 'search';
  data: any;
  timestamp: number;
  synced: boolean;
}

export class OfflineStorageManager {
  private static readonly DB_NAME = 'ToolShareOffline';
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
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', { keyPath: 'id' });
          itemStore.createIndex('type', 'type', { unique: false });
          itemStore.createIndex('synced', 'synced', { unique: false });
        }
      };
    });
  }

  /**
   * Store item offline
   */
  static async storeOffline(item: Omit<OfflineItem, 'timestamp' | 'synced'>): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(['items'], 'readwrite');
    const store = transaction.objectStore('items');

    const offlineItem: OfflineItem = {
      ...item,
      timestamp: Date.now(),
      synced: false
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

    const transaction = this.db!.transaction(['items'], 'readonly');
    const store = transaction.objectStore('items');

    return new Promise((resolve, reject) => {
      const request = type 
        ? store.index('type').getAll(type)
        : store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mark item as synced
   */
  static async markSynced(itemId: string): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(['items'], 'readwrite');
    const store = transaction.objectStore('items');

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
    const unsynced = pendingItems.filter(item => !item.synced);

    let synced = 0;
    let failed = 0;

    for (const item of unsynced) {
      try {
        // Attempt to sync item based on type
        await this.syncItem(item);
        await this.markSynced(item.id);
        synced++;
      } catch (error) {
        console.error('Failed to sync item:', error);
        failed++;
      }
    }

    return { synced, failed };
  }

  /**
   * Sync individual item
   */
  private static async syncItem(item: OfflineItem): Promise<void> {
    switch (item.type) {
      case 'item':
        // Sync item creation/update
        await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        break;
      case 'message':
        // Sync message
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        break;
    }
  }

  /**
   * Clear synced items
   */
  static async clearSyncedItems(): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(['items'], 'readwrite');
    const store = transaction.objectStore('items');
    const index = store.index('synced');

    return new Promise((resolve, reject) => {
      const request = index.getAll(true);
      
      request.onsuccess = () => {
        const syncedItems = request.result;
        const deletePromises = syncedItems.map(item => 
          new Promise<void>((res, rej) => {
            const deleteRequest = store.delete(item.id);
            deleteRequest.onsuccess = () => res();
            deleteRequest.onerror = () => rej(deleteRequest.error);
          })
        );

        Promise.all(deletePromises)
          .then(() => resolve())
          .catch(reject);
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}
```

### 4. Implementation Checklist
- [ ] Progressive Web App with service worker
- [ ] Mobile-responsive design optimizations
- [ ] Touch gesture recognition and handling
- [ ] Offline functionality with local storage
- [ ] Push notifications for mobile devices
- [ ] Mobile-specific UI patterns and components
- [ ] Image optimization for mobile bandwidth
- [ ] Fast loading and performance on mobile networks
- [ ] App-like navigation and interactions
- [ ] Mobile camera integration for item photos
- [ ] Location services integration
- [ ] Mobile app installation prompts
- [ ] Cross-platform compatibility testing
- [ ] Mobile accessibility features
- [ ] Battery and data usage optimization 