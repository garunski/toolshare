const CACHE_NAME = "toolshare-v1";
const urlsToCache = [
  "/",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync-items") {
    event.waitUntil(syncItems());
  }
});

async function syncItems() {
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

async function storeItem(item) {
  const db = await openDB();
  const tx = db.transaction("offline_items", "readwrite");
  const store = tx.objectStore("offline_items");
  await store.put(item);
}

async function getStoredItems() {
  const db = await openDB();
  const tx = db.transaction("offline_items", "readonly");
  const store = tx.objectStore("offline_items");
  return await store.getAll();
}

async function removeStoredItem(id) {
  const db = await openDB();
  const tx = db.transaction("offline_items", "readwrite");
  const store = tx.objectStore("offline_items");
  await store.delete(id);
}

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

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        }),
    );
  }
});
