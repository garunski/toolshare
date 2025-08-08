"use client";

import { useRouter, useSearchParams } from "next/navigation";

import type { Database } from "@/types/supabase";

import { AdvancedSearchInterface } from "./AdvancedSearchInterface";
import { ToolGrid } from "./ToolGrid";
import { ToolSearchForm } from "./ToolSearchForm";
import { useSearchHandlers } from "./hooks/useSearchHandlers";

type Tool = Database["public"]["Tables"]["items"]["Row"] & {
  categories: {
    name: string;
    slug: string;
  };
  profiles: {
    name: string;
    avatar_url: string;
  };
};

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SearchFacets {
  categories: { id: number; name: string; count: number }[];
  conditions: { value: string; count: number }[];
  locations: { value: string; count: number }[];
}

interface BrowseToolsWrapperProps {
  tools: Tool[];
  pagination: Pagination;
  facets: SearchFacets;
  searchParams: {
    query?: string;
    category?: string;
    availability?: string;
    page?: string;
    categories?: string;
    conditions?: string;
    location?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    tags?: string;
  };
}

export function BrowseToolsWrapper({
  tools,
  pagination,
  facets,
  searchParams,
}: BrowseToolsWrapperProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  const { handleSearch, handleAdvancedSearch } = useSearchHandlers(router);

  // Check if advanced search is being used
  const hasAdvancedFilters =
    searchParams.categories ||
    searchParams.conditions ||
    searchParams.location ||
    searchParams.tags ||
    searchParams.sortBy ||
    searchParams.sortOrder;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Search Sidebar */}
      <div className="lg:col-span-1">
        {hasAdvancedFilters ? (
          <AdvancedSearchInterface
            onSearch={handleAdvancedSearch}
            facets={facets}
          />
        ) : (
          <ToolSearchForm onSearch={handleSearch} />
        )}
      </div>

      {/* Results */}
      <div className="lg:col-span-3">
        <ToolGrid tools={tools} pagination={pagination} />
      </div>
    </div>
  );
}
