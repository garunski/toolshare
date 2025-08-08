import { ReadonlyURLSearchParams } from "next/navigation";
import { useEffect } from "react";

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
  setSelectedCategories: (categories: number[]) => void;
  setSelectedConditions: (conditions: string[]) => void;
  setSelectedLocation: (location: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: string) => void;
}

export function useUrlParameterSync(
  searchParams: ReadonlyURLSearchParams,
  searchState: SearchState,
  actions: SearchActions,
) {
  useEffect(() => {
    const query = searchParams.get("query") || "";
    const categories =
      searchParams.get("categories")?.split(",").map(Number).filter(Boolean) ||
      [];
    const conditions =
      searchParams.get("conditions")?.split(",").filter(Boolean) || [];
    const location = searchParams.get("location") || "";
    const sortBy = searchParams.get("sortBy") || "relevance";
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    // Only update if values are different to avoid infinite loops
    if (query !== searchState.query) {
      actions.setQuery(query);
    }
    if (
      JSON.stringify(categories) !==
      JSON.stringify(searchState.selectedCategories)
    ) {
      actions.setSelectedCategories(categories);
    }
    if (
      JSON.stringify(conditions) !==
      JSON.stringify(searchState.selectedConditions)
    ) {
      actions.setSelectedConditions(conditions);
    }
    if (location !== searchState.selectedLocation) {
      actions.setSelectedLocation(location);
    }
    if (sortBy !== searchState.sortBy) {
      actions.setSortBy(sortBy);
    }
    if (sortOrder !== searchState.sortOrder) {
      actions.setSortOrder(sortOrder);
    }
  }, [searchParams, actions, searchState]);
}
