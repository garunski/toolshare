import { useState } from "react";

/**
 * Custom hook for managing search state
 */
export function useSearchState() {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState("");

  const searchState = {
    query,
    selectedCategories,
    selectedConditions,
    selectedLocation,
    sortBy,
    sortOrder,
  };

  const actions = {
    setQuery,
    setSelectedCategories,
    setSelectedConditions,
    setSelectedLocation,
    setSortBy,
    setSortOrder,
  };

  const modalState = {
    showSaveModal,
    saveSearchName,
    setShowSaveModal,
    setSaveSearchName,
  };

  return {
    searchState,
    actions,
    modalState,
    showFilters,
    setShowFilters,
  };
}
