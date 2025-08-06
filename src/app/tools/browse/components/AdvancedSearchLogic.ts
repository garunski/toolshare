import { useCallback } from "react";

interface SearchState {
  query: string;
  selectedCategories: number[];
  selectedConditions: string[];
  selectedLocation: string;
  sortBy: string;
  sortOrder: string;
}

interface SearchActions {
  setQuery: (query: string) => void;
  setSelectedCategories: (
    categories: number[] | ((prev: number[]) => number[]),
  ) => void;
  setSelectedConditions: (
    conditions: string[] | ((prev: string[]) => string[]),
  ) => void;
  setSelectedLocation: (location: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: string) => void;
}

/**
 * Create search handler
 */
export function useSearchHandler(
  searchState: SearchState,
  onSearch: (filters: any) => void,
) {
  return useCallback(() => {
    const filters = {
      query: searchState.query.trim() || undefined,
      categories:
        searchState.selectedCategories.length > 0
          ? searchState.selectedCategories
          : undefined,
      condition:
        searchState.selectedConditions.length > 0
          ? searchState.selectedConditions
          : undefined,
      location: searchState.selectedLocation || undefined,
      sortBy: searchState.sortBy,
      sortOrder: searchState.sortOrder,
    };

    onSearch(filters);
  }, [
    searchState.query,
    searchState.selectedCategories,
    searchState.selectedConditions,
    searchState.selectedLocation,
    searchState.sortBy,
    searchState.sortOrder,
    onSearch,
  ]);
}

/**
 * Create filter handlers
 */
export function useFilterHandlers(
  searchState: SearchState,
  actions: SearchActions,
) {
  const handleCategoryToggle = useCallback(
    (categoryId: number) => {
      actions.setSelectedCategories((prev: number[]) =>
        prev.includes(categoryId)
          ? prev.filter((id: number) => id !== categoryId)
          : [...prev, categoryId],
      );
    },
    [actions],
  );

  const handleConditionToggle = useCallback(
    (condition: string) => {
      actions.setSelectedConditions((prev: string[]) =>
        prev.includes(condition)
          ? prev.filter((c: string) => c !== condition)
          : [...prev, condition],
      );
    },
    [actions],
  );

  const clearAllFilters = useCallback(() => {
    actions.setQuery("");
    actions.setSelectedCategories([]);
    actions.setSelectedConditions([]);
    actions.setSelectedLocation("");
    actions.setSortBy("relevance");
    actions.setSortOrder("desc");
  }, [actions]);

  const getActiveFilterCount = useCallback(() => {
    return (
      (searchState.query ? 1 : 0) +
      searchState.selectedCategories.length +
      searchState.selectedConditions.length +
      (searchState.selectedLocation ? 1 : 0)
    );
  }, [searchState]);

  return {
    handleCategoryToggle,
    handleConditionToggle,
    clearAllFilters,
    getActiveFilterCount,
  };
}
