"use client";

import { FolderIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { Input } from "@/primitives/input";

import { CategoryItem } from "./CategoryItem";

interface ExternalCategory {
  external_id: number;
  category_path: string;
  parent_id: number | null;
  level: number;
  is_active: boolean;
  last_updated: string;
  children?: ExternalCategory[];
}

interface Props {
  categories: ExternalCategory[];
  selectedCategoryId: number | null;
  onCategorySelect: (categoryId: number) => void;
}

export function CategorySelector({
  categories,
  selectedCategoryId,
  onCategorySelect,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set(),
  );

  const toggleExpanded = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filterCategories = (
    categories: ExternalCategory[],
  ): ExternalCategory[] => {
    if (!searchTerm) return categories;

    return categories
      .filter((category) => {
        const matchesSearch = category.category_path
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const childMatches = category.children
          ? filterCategories(category.children).length > 0
          : false;

        return matchesSearch || childMatches;
      })
      .map((category) => ({
        ...category,
        children: category.children
          ? filterCategories(category.children)
          : undefined,
      }));
  };

  const filteredCategories = filterCategories(categories);

  if (categories.length === 0) {
    return (
      <div className="py-12 text-center">
        <FolderIcon className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <p className="text-gray-500">
          No categories available. Please contact an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-lg font-medium text-gray-900">
          Select Item Category
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Choose the category that best describes your item. This will determine
          what additional information you&apos;ll need to provide.
        </p>

        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="max-h-96 space-y-3 overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <p>No categories match your search.</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <CategoryItem
              key={category.external_id}
              category={category}
              depth={0}
              isSelected={selectedCategoryId === category.external_id}
              isExpanded={expandedCategories.has(category.external_id)}
              onSelect={onCategorySelect}
              onToggleExpanded={toggleExpanded}
            />
          ))
        )}
      </div>

      {selectedCategoryId && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-blue-900">
              Category selected:{" "}
              {categories
                .find((c) => c.external_id === selectedCategoryId)
                ?.category_path.split(" > ")
                .pop()}
            </span>
          </div>
          <p className="mt-1 text-sm text-blue-700">
            You can proceed to the next step to provide basic information about
            your item.
          </p>
        </div>
      )}
    </div>
  );
}
