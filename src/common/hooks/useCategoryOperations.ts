import type {
  Category,
  CategoryCreationRequest,
  CategoryUpdateRequest,
} from "@/types/categories";

/**
 * Category operations hook
 */
export function useCategoryOperations(refetch: () => Promise<void>) {
  const createCategory = async (
    data: CategoryCreationRequest,
  ): Promise<Category> => {
    try {
      const response = await fetch("/api/admin/taxonomy/categories/crud", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      const newCategory = await response.json();
      await refetch(); // Refresh list
      return newCategory;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create category";
      throw new Error(message);
    }
  };

  const updateCategory = async (
    data: CategoryUpdateRequest,
  ): Promise<Category> => {
    try {
      const response = await fetch(
        `/api/admin/taxonomy/categories/crud?id=${data.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      const updatedCategory = await response.json();
      await refetch(); // Refresh list
      return updatedCategory;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update category";
      throw new Error(message);
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      const response = await fetch(
        `/api/admin/taxonomy/categories/crud?id=${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      await refetch(); // Refresh list
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete category";
      throw new Error(message);
    }
  };

  return {
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
