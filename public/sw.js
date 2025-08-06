const CACHE_NAME = "toolshare-v1";
const urlsToCache = [
  "/",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    }),
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync-items") {
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
      console.error("Failed to sync item:", error);
    }
  }
}

// Store item for offline sync
async function storeItem(item) {
  const db = await openDB();
  const tx = db.transaction("offline_items", "readwrite");
  const store = tx.objectStore("offline_items");
  await store.put(item);
}

// Get stored items
async function getStoredItems() {
  const db = await openDB();
  const tx = db.transaction("offline_items", "readonly");
  const store = tx.objectStore("offline_items");
  return await store.getAll();
}

// Remove stored item
async function removeStoredItem(id) {
  const db = await openDB();
  const tx = db.transaction("offline_items", "readwrite");
  const store = tx.objectStore("offline_items");
  await store.delete(id);
}

// Upload item to server
async function uploadItem(item) {
  const response = await fetch("/api/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    throw new Error("Failed to upload item");
  }

  return response.json();
}

// Open IndexedDB
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ToolShareOffline", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("offline_items")) {
        db.createObjectStore("offline_items", { keyPath: "id" });
      }
    };
  });
}

// Handle push notifications
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New notification from ToolShare",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View",
        icon: "/favicon.ico",
      },
      {
        action: "close",
        title: "Close",
        icon: "/favicon.ico",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("ToolShare", options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// Cache API responses for offline use
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response
          const responseClone = response.clone();

          // Cache the response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // Return cached response if network fails
          return caches.match(event.request);
        }),
    );
  }
});
