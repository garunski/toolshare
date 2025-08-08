"use client";

import { ChartBarIcon, TagIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

import { ItemStatisticsOperations } from "@/common/operations/itemStatisticsOperations";
import { useCategories } from "@/common/supabase/hooks/useCategories";
import { Badge } from "@/primitives/badge";
import { Heading } from "@/primitives/heading";
import type { Category, CategoryTreeNode } from "@/types/categories";

import { CategoryStatItem } from "./CategoryStatItem";

// Helper function to transform Category to CategoryTreeNode
function transformCategoryToTreeNode(category: Category): CategoryTreeNode {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon || undefined,
    color: category.color || undefined,
    level: 0, // Default level
    path: category.name, // Use name as path for now
    hasChildren: false, // Default to false
    children: [],
  };
}

interface CategoryStats {
  category_name: string;
  count: number;
  percentage: number;
}

export function CategoryMetrics() {
  const { categories, loading: categoriesLoading } = useCategories();
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const loadCategoryStats = async () => {
      try {
        const itemStats = await ItemStatisticsOperations.getItemStats();
        const total = itemStats.total;
        setTotalItems(total);

        const categoryStats = itemStats.by_category.map((cat) => ({
          ...cat,
          percentage: total > 0 ? (cat.count / total) * 100 : 0,
        }));

        // Sort by count and take top 10
        const sortedStats = categoryStats
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setStats(sortedStats);
      } catch (error) {
        console.error("Failed to load category stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryStats();
  }, []);

  if (loading || categoriesLoading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="animate-pulse">
          <div className="mb-6 h-6 w-1/3 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="h-5 w-5 text-gray-500" />
          <Heading level={3}>Category Distribution</Heading>
        </div>
        <Badge color="zinc">{totalItems} total items</Badge>
      </div>

      {stats.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <TagIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p>No category data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stats.map((stat, index) => {
            const category = categories.find(
              (cat) => cat.name === stat.category_name,
            );
            const categoryTreeNode = category
              ? transformCategoryToTreeNode(category)
              : undefined;

            return (
              <CategoryStatItem
                key={stat.category_name}
                stat={stat}
                category={categoryTreeNode}
                index={index}
              />
            );
          })}

          {categories.length > stats.length && (
            <div className="border-t pt-2">
              <p className="text-center text-xs text-gray-500">
                Showing top {stats.length} of {categories.length} categories
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
