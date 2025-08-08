import { useCallback, useState } from "react";

import { ItemSearchOperations } from "@/common/operations/itemSearchOperations";
import type { ItemWithCategory } from "@/types/categories";

export function useItemSearch() {
  const [searchResults, setSearchResults] = useState<ItemWithCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const searchItems = useCallback(
    async (filters: {
      search?: string;
      categoryId?: string;
      location?: string;
      condition?: string[];
      limit?: number;
      offset?: number;
    }) => {
      try {
        setLoading(true);
        setError(null);
        const { data, count } = await ItemSearchOperations.searchItems(filters);
        setSearchResults(data);
        setTotalCount(count);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search items");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    searchResults,
    loading,
    error,
    totalCount,
    searchItems,
  };
}
