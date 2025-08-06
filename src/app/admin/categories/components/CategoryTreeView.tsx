"use client";

import { CogIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { CategoryOperations } from "@/common/operations/categoryOperations";
import type { CategoryTreeNode as CategoryTreeNodeType } from "@/types/categories";

import { CategoryTreeNode } from "./CategoryTreeNode";

interface Props {
  categories: CategoryTreeNodeType[];
  onEdit: (category: any) => void;
  onManageAttributes: (category: any) => void;
  onRefresh: () => void;
}

export function CategoryTreeView({
  categories,
  onEdit,
  onManageAttributes,
  onRefresh,
}: Props) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleDelete = async (category: CategoryTreeNodeType) => {
    if (
      !confirm(
        `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingId(category.id);
    try {
      await CategoryOperations.deleteCategory(category.id);
      onRefresh();
    } catch (error) {
      alert(
        `Failed to delete category: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setDeletingId(null);
    }
  };

  const renderCategoryNode = (node: CategoryTreeNodeType) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <CategoryTreeNode
        key={node.id}
        node={node}
        isExpanded={isExpanded}
        hasChildren={Boolean(hasChildren)}
        isDeleting={deletingId === node.id}
        onToggleExpanded={toggleExpanded}
        onEdit={onEdit}
        onManageAttributes={onManageAttributes}
        onDelete={handleDelete}
      />
    );
  };

  if (categories.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="mb-4">
          <CogIcon className="mx-auto h-12 w-12 text-gray-300" />
        </div>
        <p>No categories found. Create your first category to get started.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {categories.map((category) => renderCategoryNode(category))}
    </div>
  );
}
