"use client";

import { useCallback, useEffect } from "react";

import { AdvancedFilters } from "./AdvancedFilters";
import { SearchActions } from "./AdvancedSearchActions";
import { ActiveFilters, SaveSearchModal } from "./AdvancedSearchComponents";
import { useFilterHandlers, useSearchHandler } from "./AdvancedSearchLogic";
import { useSearchState } from "./AdvancedSearchState";

interface Props {
  onSearch: (filters: any) => void;
  facets: {
    categories: { id: number; name: string; count: number }[];
    conditions: { value: string; count: number }[];
    locations: { value: string; count: number }[];
  };
  loading?: boolean;
}

export function AdvancedSearchInterface({ onSearch, facets, loading }: Props) {
  const { searchState, actions, modalState, showFilters, setShowFilters } =
    useSearchState();

  const handleSearch = useSearchHandler(searchState, onSearch);
  const {
    handleCategoryToggle,
    handleConditionToggle,
    clearAllFilters,
    getActiveFilterCount,
  } = useFilterHandlers(searchState, actions);

  const handleSaveSearch = useCallback(async () => {
    if (!modalState.saveSearchName.trim()) return;

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

    // This would need user context - for now just close modal
    modalState.setShowSaveModal(false);
    modalState.setSaveSearchName("");
  }, [searchState, modalState]);

  // Auto-search when filters change
  useEffect(() => {
    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [handleSearch]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <SearchActions
        query={searchState.query}
        onQueryChange={actions.setQuery}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onShowSaveModal={() => modalState.setShowSaveModal(true)}
        activeFilterCount={getActiveFilterCount()}
      />

      {/* Active Filters */}
      {getActiveFilterCount() > 0 && (
        <ActiveFilters
          query={searchState.query}
          selectedCategories={searchState.selectedCategories}
          selectedConditions={searchState.selectedConditions}
          selectedLocation={searchState.selectedLocation}
          facets={facets}
          onQueryClear={() => actions.setQuery("")}
          onCategoryToggle={handleCategoryToggle}
          onConditionToggle={handleConditionToggle}
          onLocationClear={() => actions.setSelectedLocation("")}
          onClearAll={clearAllFilters}
        />
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <AdvancedFilters
          facets={facets}
          selectedCategories={searchState.selectedCategories}
          selectedConditions={searchState.selectedConditions}
          selectedLocation={searchState.selectedLocation}
          sortBy={searchState.sortBy}
          sortOrder={searchState.sortOrder}
          onCategoryToggle={handleCategoryToggle}
          onConditionToggle={handleConditionToggle}
          onLocationChange={actions.setSelectedLocation}
          onSortByChange={actions.setSortBy}
          onSortOrderChange={actions.setSortOrder}
        />
      )}

      {/* Save Search Modal */}
      {modalState.showSaveModal && (
        <SaveSearchModal
          saveSearchName={modalState.saveSearchName}
          onSaveSearchNameChange={modalState.setSaveSearchName}
          onSave={handleSaveSearch}
          onClose={() => modalState.setShowSaveModal(false)}
        />
      )}
    </div>
  );
}
