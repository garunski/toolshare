"use client";

import { useEffect } from "react";

import { AppHeader } from "@/common/components/AppHeader";
import { useAuth } from "@/common/hooks/useAuth";

import { ToolGrid } from "./components/ToolGrid";
import { ToolSearchForm } from "./components/ToolSearchForm";
import { useToolSearch } from "./hooks/useToolSearch";

export default function BrowseToolsPage() {
  const { user } = useAuth();
  const { tools, loading, error, loadTools, handleSearch } = useToolSearch();

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  // Ensure error is always a string
  const errorMessage = typeof error === "string" ? error : "An error occurred";

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        title="Browse Tools"
        subtitle="Discover tools available in your community"
      />

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
                  <p className="text-red-600">{errorMessage}</p>
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
