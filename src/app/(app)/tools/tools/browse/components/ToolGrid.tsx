"use client";

import type { Database } from "@/types/supabase";

import { ToolCard } from "./ToolCard";

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

interface ToolGridProps {
  tools: Tool[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function ToolGrid({ tools, pagination }: ToolGridProps) {
  if (tools.length === 0) {
    return (
      <div className="py-12 text-center">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          No tools found
        </h3>
        <p className="text-gray-600">
          Try adjusting your search criteria or check back later.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          {pagination.total} tool{pagination.total !== 1 ? "s" : ""} available
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
}
