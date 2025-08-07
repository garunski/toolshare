import { useCallback, useEffect, useState } from "react";

import { CategoryOperations } from "@/common/operations/categoryOperations";
import type {
  Category,
  CategoryCreationRequest,
  CategoryTreeNode,
  CategoryUpdateRequest,
  CategoryWithAttributes,
} from "@/types/categories";

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
      const data = await CategoryOperations.getAllCategoriesTree();
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

  const createCategory = useCallback(
    async (data: CategoryCreationRequest): Promise<Category> => {
      try {
        const newCategory = await CategoryOperations.createCategory(data);
        await fetchCategories(); // Refresh list
        return newCategory;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create category";
        setError(message);
        throw new Error(message);
      }
    },
    [fetchCategories],
  );

  const updateCategory = useCallback(
    async (data: CategoryUpdateRequest): Promise<Category> => {
      try {
        const updatedCategory = await CategoryOperations.updateCategory(data);
        await fetchCategories(); // Refresh list
        return updatedCategory;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update category";
        setError(message);
        throw new Error(message);
      }
    },
    [fetchCategories],
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<void> => {
      try {
        await CategoryOperations.deleteCategory(id);
        await fetchCategories(); // Refresh list
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete category";
        setError(message);
        throw new Error(message);
      }
    },
    [fetchCategories],
  );

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
      const data =
        await CategoryOperations.getCategoryWithAttributes(categoryId);
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
