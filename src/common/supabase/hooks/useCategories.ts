import { useCallback, useEffect, useState } from "react";

import type { Category } from "@/types/categories";

import { useCategoryOperations } from "./useCategoryOperations";

export interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export function useCategories() {
  const [state, setState] = useState<CategoriesState>({
    categories: [],
    loading: true,
    error: null,
  });

  const fetchCategories = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await fetch("/api/admin/taxonomy/categories/crud");
      
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const categories = await response.json();
      setState((prev) => ({
        ...prev,
        categories,
        loading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch categories";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }, []);

  const operations = useCategoryOperations(fetchCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    ...state,
    ...operations,
    refetch: fetchCategories,
  };
}
