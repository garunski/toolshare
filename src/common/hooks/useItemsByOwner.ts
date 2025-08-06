import { useCallback, useEffect, useState } from "react";

import { ItemOwnerOperations } from "@/common/operations/itemOwnerOperations";
import type { ItemWithCategory } from "@/types/categories";

export function useItemsByOwner(ownerId: string) {
  const [items, setItems] = useState<ItemWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    if (!ownerId) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await ItemOwnerOperations.getItemsByOwner(ownerId);
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load owner items",
      );
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    error,
    refresh: loadItems,
  };
}
