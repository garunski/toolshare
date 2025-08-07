import { useCallback, useEffect, useState } from "react";

import { ItemOperations } from "@/common/operations/itemOperations";
import { ItemSearchOperations } from "@/common/operations/itemSearchOperations";
import type {
  ItemCreationRequest,
  ItemUpdateRequest,
  ItemWithCategory,
} from "@/types/categories";

export function useItems() {
  const [items, setItems] = useState<ItemWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await ItemSearchOperations.searchItems({ limit: 50 });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  }, []);

  const createItem = useCallback(
    async (itemData: ItemCreationRequest) => {
      try {
        setError(null);
        const newItem = await ItemOperations.createItem(itemData);
        // Reload items to get the new item with category path
        await loadItems();
        return newItem;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create item";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [loadItems],
  );

  const updateItem = useCallback(async (updateData: ItemUpdateRequest) => {
    try {
      setError(null);
      const updatedItem = await ItemOperations.updateItem(updateData);
      setItems((prev) =>
        prev.map((item) =>
          item.id === updateData.id ? { ...item, ...updatedItem } : item,
        ),
      );
      return updatedItem;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update item";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteItem = useCallback(async (itemId: string) => {
    try {
      setError(null);
      await ItemOperations.deleteItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete item";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refresh: loadItems,
  };
}

export function useItem(itemId: string) {
  const [item, setItem] = useState<ItemWithCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItem = useCallback(async () => {
    if (!itemId) {
      setItem(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await ItemOperations.getItemById(itemId);
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load item");
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    loadItem();
  }, [loadItem]);

  return {
    item,
    loading,
    error,
    refresh: loadItem,
  };
}
