"use client";

import { useState } from "react";

import { AdminProtection } from "@/app/admin/components/AdminProtection";
import { useCategories } from "@/common/hooks/useCategories";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import type { Category } from "@/types/categories";

import { CategoryAttributeModal } from "./components/CategoryAttributeModal";
import { CategoryFormModal } from "./components/CategoryFormModal";
import { CategoryTreeView } from "./components/CategoryTreeView";

export default function AdminCategoriesPage() {
  const { categories, loading, error, refetch } = useCategories();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [managingAttributes, setManagingAttributes] = useState<Category | null>(
    null,
  );

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowCreateModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCreateModal(true);
  };

  const handleManageAttributes = (category: Category) => {
    setManagingAttributes(category);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingCategory(null);
    refetch();
  };

  const handleAttributeModalClose = () => {
    setManagingAttributes(null);
    refetch();
  };

  if (loading) {
    return (
      <AdminProtection>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="mb-6 h-8 w-1/4 rounded bg-gray-200"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminProtection>
    );
  }

  if (error) {
    return (
      <AdminProtection>
        <div className="p-6">
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">Error loading categories: {error}</p>
            <Button onClick={refetch} className="mt-2">
              Retry
            </Button>
          </div>
        </div>
      </AdminProtection>
    );
  }

  return (
    <AdminProtection>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <Heading level={1}>Category Management</Heading>
          <Button onClick={handleCreateCategory}>Create Category</Button>
        </div>

        <div className="rounded-lg bg-white shadow">
          <CategoryTreeView
            categories={categories}
            onEdit={handleEditCategory}
            onManageAttributes={handleManageAttributes}
            onRefresh={refetch}
          />
        </div>

        {showCreateModal && (
          <CategoryFormModal
            category={editingCategory}
            onClose={handleModalClose}
            onSuccess={handleModalClose}
          />
        )}

        {managingAttributes && (
          <CategoryAttributeModal
            category={managingAttributes}
            onClose={handleAttributeModalClose}
            onSuccess={handleAttributeModalClose}
          />
        )}
      </div>
    </AdminProtection>
  );
}
