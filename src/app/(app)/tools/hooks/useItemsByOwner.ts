import { useCallback, useEffect, useState } from "react";

// Removed direct operation import - now using API routes
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

      const response = await fetch(`/api/tools/owner?ownerId=${ownerId}`);

      if (!response.ok) {
        throw new Error("Failed to load owner items");
      }

      const data = await response.json();
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
