"use client";

import { useEffect, useState } from "react";

import { AdminProtection } from "@/app/admin/components/AdminProtection";
import { ExternalTaxonomyOperations } from "@/common/operations/externalTaxonomyOperations";
import { Heading } from "@/primitives/heading";
import type { ExternalTaxonomyNode } from "@/types/categories";

import { ExternalTaxonomyBrowser } from "../components/ExternalTaxonomyBrowser";
import { ExternalTaxonomyDetailsModal } from "../components/ExternalTaxonomyDetailsModal";
import { ExternalTaxonomyStats } from "../components/ExternalTaxonomyStats";

export default function ExternalTaxonomyPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<ExternalTaxonomyNode | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState<{
    totalCategories: number;
    levels: Record<number, number>;
    activeCategories: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const categoryStats = await ExternalTaxonomyOperations.getCategoryStats();
      setStats(categoryStats);
    } catch (error) {
      console.error("Failed to load taxonomy stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSelectCategory = (category: ExternalTaxonomyNode) => {
    setSelectedCategory(category);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedCategory(null);
  };

  return (
    <AdminProtection>
      <div className="p-6">
        <div className="mb-6">
          <Heading level={1}>External Taxonomy Browser</Heading>
          <p className="mt-2 text-gray-600">
            Browse and manage external product taxonomy categories
          </p>
        </div>

        <ExternalTaxonomyStats stats={stats} loadingStats={loadingStats} />

        {/* External Taxonomy Browser */}
        <div className="rounded-lg border bg-white">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Browse Categories</h2>
            <p className="text-sm text-gray-600">
              Search and navigate through the external product taxonomy
            </p>
          </div>
          <div className="p-4">
            <ExternalTaxonomyBrowser
              onSelectCategory={handleSelectCategory}
              selectedCategoryId={selectedCategory?.external_id || null}
            />
          </div>
        </div>

        <ExternalTaxonomyDetailsModal
          category={selectedCategory}
          open={showDetailsModal}
          onClose={handleCloseModal}
        />
      </div>
    </AdminProtection>
  );
}
