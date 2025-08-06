"use client";

import { SparklesIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/primitives/badge";

import { CategorySuggestionItem } from "./CategorySuggestionItem";
import { useCategorySuggestions } from "./hooks/useCategorySuggestions";

interface CategorySuggestion {
  external_id: number;
  category_path: string;
  confidence: number;
  reasons: string[];
  level: number;
}

interface Props {
  itemName: string;
  itemDescription?: string;
  attributes?: Record<string, any>;
  tags?: string[];
  onCategorySelect: (categoryId: number) => void;
  selectedCategoryId?: number | null;
}

// Loading state component
function LoadingState() {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center space-x-2">
        <SparklesIcon className="h-5 w-5 animate-pulse text-blue-500" />
        <span className="text-sm font-medium">Finding best categories...</span>
      </div>
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-gray-200"></div>
        ))}
      </div>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <p className="text-sm text-yellow-800">
        No category suggestions found. Try adding more details or browse
        categories manually.
      </p>
    </div>
  );
}

// Suggestions list component
function SuggestionsList({
  suggestions,
  selectedCategoryId,
  onCategorySelect,
  autoSelected,
}: {
  suggestions: CategorySuggestion[];
  selectedCategoryId?: number | null;
  onCategorySelect: (categoryId: number) => void;
  autoSelected: boolean;
}) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center space-x-2">
        <SparklesIcon className="h-5 w-5 text-blue-500" />
        <span className="text-sm font-medium">Suggested Categories</span>
        {autoSelected && <Badge color="green">Auto-selected</Badge>}
      </div>

      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <CategorySuggestionItem
            key={suggestion.external_id}
            suggestion={suggestion}
            isSelected={selectedCategoryId === suggestion.external_id}
            onSelect={() => onCategorySelect(suggestion.external_id)}
          />
        ))}
      </div>

      <div className="mt-4 text-center text-xs text-gray-500">
        Suggestions based on item name, description, and existing
        categorizations
      </div>
    </div>
  );
}

export function CategorySuggestions({
  itemName,
  itemDescription,
  attributes,
  tags,
  onCategorySelect,
  selectedCategoryId,
}: Props) {
  const { suggestions, loading, autoSelected } = useCategorySuggestions(
    itemName,
    itemDescription,
    attributes,
    tags,
    selectedCategoryId,
    onCategorySelect,
  );

  if (!itemName.trim()) {
    return (
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-center text-sm text-gray-500">
          Enter an item name to see category suggestions
        </p>
      </div>
    );
  }

  if (loading) {
    return <LoadingState />;
  }

  if (suggestions.length === 0) {
    return <EmptyState />;
  }

  return (
    <SuggestionsList
      suggestions={suggestions}
      selectedCategoryId={selectedCategoryId}
      onCategorySelect={onCategorySelect}
      autoSelected={autoSelected}
    />
  );
}
