"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";
import { Select } from "@/primitives/select";

interface Props {
  searchTerm: string;
  levelFilter: string;
  loading: boolean;
  onSearchTermChange: (value: string) => void;
  onLevelFilterChange: (value: string) => void;
  onSearch: () => void;
  onRefresh: () => void;
}

export function ExternalTaxonomySearchControls({
  searchTerm,
  levelFilter,
  loading,
  onSearchTermChange,
  onLevelFilterChange,
  onSearch,
  onRefresh,
}: Props) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Search Categories
          </label>
          <div className="flex space-x-2">
            <Input
              placeholder="Search by path or ID..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && onSearch()}
            />
            <Button onClick={onSearch}>
              <MagnifyingGlassIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Filter by Level
          </label>
          <Select
            value={levelFilter}
            onChange={(e) => onLevelFilterChange(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
          </Select>
        </div>

        <div className="flex items-end">
          <Button onClick={onRefresh} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>
    </div>
  );
}
