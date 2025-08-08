import { useCallback, useEffect, useState } from "react";

import type {
  Category,
  CategoryCreationRequest,
  CategoryTreeNode,
  CategoryUpdateRequest,
  CategoryWithAttributes,
} from "@/types/categories";

import { useCategoryOperations } from "./useCategoryOperations";

interface UseCategoriesReturn {
  categories: CategoryTreeNode[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createCategory: (data: CategoryCreationRequest) => Promise<Category>;
  updateCategory: (data: CategoryUpdateRequest) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/taxonomy/categories/tree");

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const { createCategory, updateCategory, deleteCategory } =
    useCategoryOperations(fetchCategories);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

interface UseCategoryReturn {
  category: CategoryWithAttributes | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCategory(categoryId: string | null): UseCategoryReturn {
  const [category, setCategory] = useState<CategoryWithAttributes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = useCallback(async () => {
    if (!categoryId) {
      setCategory(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/taxonomy/categories/route?id=${categoryId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch category");
      }

      const data = await response.json();
      setCategory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch category");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  return {
    category,
    loading,
    error,
    refetch: fetchCategory,
  };
}
