"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/common/hooks/useAuth";
import { ToolDataProcessor } from "@/common/operations/toolDataProcessor";
import type { Database } from "@/types/supabase";

import { ToolGrid } from "./components/ToolGrid";
import { ToolSearchForm } from "./components/ToolSearchForm";

type Tool = Database["public"]["Tables"]["tools"]["Row"] & {
  profiles: {
    id: string;
    first_name: string;
    last_name: string;
  };
};

export default function BrowseToolsPage() {
  const { user } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableTools();
  }, []);

  const loadAvailableTools = async () => {
    setLoading(true);
    const result = await ToolDataProcessor.getAvailableTools();

    if (result.success) {
      setTools(
        result.data?.map((tool: any) => ({
          ...tool,
          profiles: {
            id: tool.owner_id,
            first_name: "Unknown",
            last_name: "User",
          },
        })) || [],
      );
    } else {
      setError(result.error || "Failed to load tools");
    }

    setLoading(false);
  };

  const handleSearch = async (searchData: any) => {
    setLoading(true);
    const result = await ToolDataProcessor.searchTools(searchData);

    if (result.success) {
      setTools(
        result.data?.map((tool: any) => ({
          ...tool,
          profiles: {
            id: tool.owner_id,
            first_name: "Unknown",
            last_name: "User",
          },
        })) || [],
      );
    } else {
      setError(result.error || "Failed to search tools");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Browse Tools</h1>
            <p className="text-gray-600">
              Discover tools available in your community
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Search Sidebar */}
            <div className="lg:col-span-1">
              <ToolSearchForm onSearch={handleSearch} />
            </div>

            {/* Tools Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <p>Loading tools...</p>
                </div>
              ) : error ? (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : tools.length === 0 ? (
                <div className="py-12 text-center">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    No tools found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search criteria or check back later.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900">
                      {tools.length} tool{tools.length !== 1 ? "s" : ""}{" "}
                      available
                    </h2>
                  </div>
                  <ToolGrid tools={tools} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
