"use client";

import { Filter, Search, X } from "lucide-react";
import { useState } from "react";

import type { ToolSearchData } from "@/app/tools/tools/add/validation";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import { Input } from "@/primitives/input";

import { ToolSearchFilters } from "./ToolSearchFilters";

interface ToolSearchFormProps {
  onSearch: (searchData: ToolSearchData) => void;
}

export function ToolSearchForm({ onSearch }: ToolSearchFormProps) {
  const [searchData, setSearchData] = useState<ToolSearchData>({
    query: "",
    category: undefined,
    condition: undefined,
    is_available: true,
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(searchData);
  };

  const handleReset = () => {
    const resetData: ToolSearchData = {
      query: "",
      category: undefined,
      condition: undefined,
      is_available: true,
    };
    setSearchData(resetData);
    onSearch(resetData);
  };

  const hasActiveFilters =
    searchData.category || searchData.condition || searchData.query;

  return (
    <div className="rounded-lg border border-zinc-950/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="mb-4">
        <Heading
          level={3}
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Search className="h-5 w-5" />
          Search Tools
        </Heading>
      </div>
      <div className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <Input
            placeholder="Search tools..."
            value={searchData.query || ""}
            onChange={(e) =>
              setSearchData((prev) => ({ ...prev, query: e.target.value }))
            }
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} className="w-full">
            Search
          </Button>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between">
          <Button
            outline
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          {hasActiveFilters && (
            <Button
              plain
              onClick={handleReset}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <ToolSearchFilters
            searchData={searchData}
            onSearchDataChange={setSearchData}
            onSearch={handleSearch}
          />
        )}
      </div>
    </div>
  );
}
