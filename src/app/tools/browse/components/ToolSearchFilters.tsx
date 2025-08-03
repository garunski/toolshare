"use client";

import type { ToolSearchData } from "@/common/validators/toolCreationValidator";
import { Button } from "@/primitives/button";
import { Select } from "@/primitives/select";

interface ToolSearchFiltersProps {
  searchData: ToolSearchData;
  onSearchDataChange: (data: ToolSearchData) => void;
  onSearch: () => void;
}

const categories = [
  "Power Tools",
  "Hand Tools",
  "Garden Tools",
  "Automotive",
  "Cleaning",
  "Ladders & Scaffolding",
  "Safety Equipment",
  "Other",
];

const conditions = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

export function ToolSearchFilters({
  searchData,
  onSearchDataChange,
  onSearch,
}: ToolSearchFiltersProps) {
  return (
    <div className="space-y-4 border-t pt-4">
      {/* Category Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-900 dark:text-white">
          Category
        </label>
        <Select
          value={searchData.category || ""}
          onChange={(e) =>
            onSearchDataChange({
              ...searchData,
              category: (e.target.value || undefined) as any,
            })
          }
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </div>

      {/* Condition Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-900 dark:text-white">
          Condition
        </label>
        <Select
          value={searchData.condition || ""}
          onChange={(e) =>
            onSearchDataChange({
              ...searchData,
              condition: (e.target.value || undefined) as any,
            })
          }
        >
          <option value="">All conditions</option>
          {conditions.map((condition) => (
            <option key={condition.value} value={condition.value}>
              {condition.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Availability Filter */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-900 dark:text-white">
          Availability
        </label>
        <Select
          value={searchData.is_available?.toString() || ""}
          onChange={(e) =>
            onSearchDataChange({
              ...searchData,
              is_available: e.target.value === "true",
            })
          }
        >
          <option value="">All tools</option>
          <option value="true">Available only</option>
          <option value="false">Unavailable only</option>
        </Select>
      </div>

      {/* Apply Filters Button */}
      <Button onClick={onSearch} className="w-full">
        Apply Filters
      </Button>
    </div>
  );
}
