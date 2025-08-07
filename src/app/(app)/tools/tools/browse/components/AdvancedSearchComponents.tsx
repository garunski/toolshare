import { XMarkIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";

interface Facets {
  categories: { id: number; name: string; count: number }[];
  conditions: { value: string; count: number }[];
  locations: { value: string; count: number }[];
}

// Active Filters Component
export function ActiveFilters({
  query,
  selectedCategories,
  selectedConditions,
  selectedLocation,
  facets,
  onQueryClear,
  onCategoryToggle,
  onConditionToggle,
  onLocationClear,
  onClearAll,
}: {
  query: string;
  selectedCategories: number[];
  selectedConditions: string[];
  selectedLocation: string;
  facets: Facets;
  onQueryClear: () => void;
  onCategoryToggle: (id: number) => void;
  onConditionToggle: (condition: string) => void;
  onLocationClear: () => void;
  onClearAll: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {query && (
        <Badge className="flex items-center gap-1">
          Search: &quot;{query}&quot;
          <button onClick={onQueryClear} className="ml-1 hover:text-red-500">
            <XMarkIcon className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {selectedCategories.map((categoryId) => {
        const category = facets.categories.find((c) => c.id === categoryId);
        return (
          <Badge key={categoryId} className="flex items-center gap-1">
            Category: {category?.name || `ID ${categoryId}`}
            <button
              onClick={() => onCategoryToggle(categoryId)}
              className="ml-1 hover:text-red-500"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}
      {selectedConditions.map((condition) => (
        <Badge key={condition} className="flex items-center gap-1">
          Condition: {condition}
          <button
            onClick={() => onConditionToggle(condition)}
            className="ml-1 hover:text-red-500"
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {selectedLocation && (
        <Badge className="flex items-center gap-1">
          Location: {selectedLocation}
          <button onClick={onLocationClear} className="ml-1 hover:text-red-500">
            <XMarkIcon className="h-3 w-3" />
          </button>
        </Badge>
      )}
      <Button
        onClick={onClearAll}
        className="text-gray-500 hover:text-gray-700"
      >
        Clear all
      </Button>
    </div>
  );
}

// Save Search Modal Component
export function SaveSearchModal({
  saveSearchName,
  onSaveSearchNameChange,
  onSave,
  onClose,
}: {
  saveSearchName: string;
  onSaveSearchNameChange: (name: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="mb-4 text-lg font-medium">Save Search</h3>
        <Input
          type="text"
          placeholder="Enter search name..."
          value={saveSearchName}
          onChange={(e) => onSaveSearchNameChange(e.target.value)}
          className="mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}
