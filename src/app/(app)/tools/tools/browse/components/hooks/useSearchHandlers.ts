import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useCallback } from "react";

export function useSearchHandlers(router: AppRouterInstance) {
  const handleSearch = useCallback(
    (searchData: any) => {
      const params = new URLSearchParams();

      if (searchData.query) params.set("query", searchData.query);
      if (searchData.category) params.set("category", searchData.category);
      if (searchData.is_available !== undefined) {
        params.set(
          "availability",
          searchData.is_available ? "available" : "unavailable",
        );
      }

      const queryString = params.toString();
      const url = queryString
        ? `/tools/browse?${queryString}`
        : "/tools/browse";
      router.push(url);
    },
    [router],
  );

  const handleAdvancedSearch = useCallback(
    (filters: any) => {
      const params = new URLSearchParams();

      // Basic search
      if (filters.query) params.set("query", filters.query);
      if (filters.category) params.set("category", filters.category);
      if (filters.availability)
        params.set("availability", filters.availability);

      // Advanced filters
      if (filters.categories?.length) {
        params.set("categories", filters.categories.join(","));
      }
      if (filters.conditions?.length) {
        params.set("conditions", filters.conditions.join(","));
      }
      if (filters.location) {
        params.set("location", filters.location);
      }
      if (filters.tags?.length) {
        params.set("tags", filters.tags.join(","));
      }
      if (filters.sortBy) {
        params.set("sortBy", filters.sortBy);
      }
      if (filters.sortOrder) {
        params.set("sortOrder", filters.sortOrder);
      }

      const queryString = params.toString();
      const url = queryString
        ? `/tools/browse?${queryString}`
        : "/tools/browse";
      router.push(url);
    },
    [router],
  );

  return { handleSearch, handleAdvancedSearch };
}
