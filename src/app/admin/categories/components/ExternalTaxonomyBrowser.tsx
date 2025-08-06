"use client";

import { FolderIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";

import { ExternalTaxonomyOperations } from "@/common/operations/externalTaxonomyOperations";
import { Button } from "@/primitives/button";
import type { ExternalTaxonomyNode as ExternalTaxonomyNodeType } from "@/types/categories";

import { ExternalTaxonomyNode } from "./ExternalTaxonomyNode";
import { ExternalTaxonomySearchControls } from "./ExternalTaxonomySearchControls";

interface Props {
  onSelectCategory?: (category: ExternalTaxonomyNodeType) => void;
  selectedCategoryId?: number | null;
}

export function ExternalTaxonomyBrowser({
  onSelectCategory,
  selectedCategoryId,
}: Props) {
  const [categories, setCategories] = useState<ExternalTaxonomyNodeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const result = await ExternalTaxonomyOperations.getCategories({
        page: currentPage,
        level: levelFilter === "all" ? undefined : parseInt(levelFilter),
        search: searchTerm || undefined,
      });
      setCategories(result.categories);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to load external taxonomy:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, levelFilter, searchTerm]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadCategories();
  };

  const toggleExpanded = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderCategoryNode = (node: ExternalTaxonomyNodeType, depth = 0) => {
    const isExpanded = expandedNodes.has(node.external_id);
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedCategoryId === node.external_id;
    return (
      <ExternalTaxonomyNode
        key={node.external_id}
        node={node}
        depth={depth}
        isExpanded={isExpanded}
        hasChildren={Boolean(hasChildren)}
        isSelected={isSelected}
        onToggleExpanded={toggleExpanded}
        onSelectCategory={onSelectCategory}
      />
    );
  };

  return (
    <div className="space-y-4">
      <ExternalTaxonomySearchControls
        searchTerm={searchTerm}
        levelFilter={levelFilter}
        loading={loading}
        onSearchTermChange={setSearchTerm}
        onLevelFilterChange={setLevelFilter}
        onSearch={handleSearch}
        onRefresh={loadCategories}
      />

      {/* Category Tree */}
      <div className="rounded-lg border bg-white">
        {loading ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-500">Loading external taxonomy...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center">
            <FolderIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">
              {searchTerm
                ? "No categories match your search criteria."
                : "No external categories found."}
            </p>
            {searchTerm && (
              <Button onClick={() => setSearchTerm("")} className="mt-2">
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((category) => renderCategoryNode(category))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            outline
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            outline
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
