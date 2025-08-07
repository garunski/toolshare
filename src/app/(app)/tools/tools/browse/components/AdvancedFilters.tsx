import { Checkbox } from "@/primitives/checkbox";
import { Select } from "@/primitives/select";

interface Facets {
  categories: { id: number; name: string; count: number }[];
  conditions: { value: string; count: number }[];
  locations: { value: string; count: number }[];
}

export function AdvancedFilters({
  facets,
  selectedCategories,
  selectedConditions,
  selectedLocation,
  sortBy,
  sortOrder,
  onCategoryToggle,
  onConditionToggle,
  onLocationChange,
  onSortByChange,
  onSortOrderChange,
}: {
  facets: Facets;
  selectedCategories: number[];
  selectedConditions: string[];
  selectedLocation: string;
  sortBy: string;
  sortOrder: string;
  onCategoryToggle: (id: number) => void;
  onConditionToggle: (condition: string) => void;
  onLocationChange: (location: string) => void;
  onSortByChange: (sortBy: string) => void;
  onSortOrderChange: (sortOrder: string) => void;
}) {
  return (
    <div className="rounded-lg border bg-gray-50 p-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Categories */}
        <div>
          <h4 className="mb-3 font-medium text-gray-900">Categories</h4>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {facets.categories.slice(0, 10).map((category) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-2"
              >
                <Checkbox
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => onCategoryToggle(category.id)}
                />
                <span className="text-sm">
                  {category.name} ({category.count})
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div>
          <h4 className="mb-3 font-medium text-gray-900">Condition</h4>
          <div className="space-y-2">
            {facets.conditions.map((condition) => (
              <label
                key={condition.value}
                className="flex cursor-pointer items-center gap-2"
              >
                <Checkbox
                  checked={selectedConditions.includes(condition.value)}
                  onChange={() => onConditionToggle(condition.value)}
                />
                <span className="text-sm capitalize">
                  {condition.value} ({condition.count})
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Location and Sort */}
        <div className="space-y-4">
          <div>
            <h4 className="mb-3 font-medium text-gray-900">Location</h4>
            <Select
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
            >
              <option value="">All locations</option>
              {facets.locations.slice(0, 10).map((location) => (
                <option key={location.value} value={location.value}>
                  {location.value} ({location.count})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <h4 className="mb-3 font-medium text-gray-900">Sort by</h4>
            <div className="space-y-2">
              <Select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date added</option>
                <option value="name">Name</option>
                <option value="condition">Condition</option>
              </Select>

              <Select
                value={sortOrder}
                onChange={(e) => onSortOrderChange(e.target.value)}
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
