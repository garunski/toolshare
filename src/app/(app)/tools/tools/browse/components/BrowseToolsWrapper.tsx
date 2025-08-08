"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import type { Database } from "@/types/supabase";

import { ToolGrid } from "./ToolGrid";
import { ToolSearchForm } from "./ToolSearchForm";

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

interface BrowseToolsWrapperProps {
  tools: Tool[];
  pagination: Pagination;
}

export function BrowseToolsWrapper({
  tools,
  pagination,
}: BrowseToolsWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get("query") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentAvailability = searchParams.get("availability") || "";

  const handleSearch = useCallback(
    (searchData: any) => {
      const params = new URLSearchParams();

      if (searchData.query) params.set("query", searchData.query);
      if (searchData.category) params.set("category", searchData.category);
      if (searchData.is_available !== undefined) {
        params.set(
          "availability",
          searchData.is_available ? "available" : "unavailable",
        );
      }

      const queryString = params.toString();
      const url = queryString
        ? `/tools/browse?${queryString}`
        : "/tools/browse";
      router.push(url);
    },
    [router],
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Search Sidebar */}
      <div className="lg:col-span-1">
        <ToolSearchForm onSearch={handleSearch} />
      </div>

      {/* Results */}
      <div className="lg:col-span-3">
        <ToolGrid tools={tools} pagination={pagination} />
      </div>
    </div>
  );
}
