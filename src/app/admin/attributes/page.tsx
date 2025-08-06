"use client";

import { useState } from "react";

import { AdminProtection } from "@/app/admin/components/AdminProtection";
import { useAttributes } from "@/common/hooks/useAttributes";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import type { AttributeDefinition } from "@/types/categories";

import { AttributeFormModal } from "./components/AttributeFormModal";
import { AttributeListView } from "./components/AttributeListView";
import { AttributePreviewModal } from "./components/AttributePreviewModal";

export default function AdminAttributesPage() {
  const { attributes, loading, error, refresh } = useAttributes();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAttribute, setEditingAttribute] =
    useState<AttributeDefinition | null>(null);
  const [previewingAttribute, setPreviewingAttribute] =
    useState<AttributeDefinition | null>(null);

  const handleCreateAttribute = () => {
    setEditingAttribute(null);
    setShowCreateModal(true);
  };

  const handleEditAttribute = (attribute: AttributeDefinition) => {
    setEditingAttribute(attribute);
    setShowCreateModal(true);
  };

  const handlePreviewAttribute = (attribute: AttributeDefinition) => {
    setPreviewingAttribute(attribute);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingAttribute(null);
    refresh();
  };

  const handlePreviewClose = () => {
    setPreviewingAttribute(null);
  };

  if (loading) {
    return (
      <AdminProtection>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="mb-6 h-8 w-1/4 rounded bg-gray-200"></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 rounded bg-gray-200"></div>
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
            <p className="text-red-800">Error loading attributes: {error}</p>
            <Button onClick={refresh} className="mt-2">
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
          <Heading level={1}>Attribute Management</Heading>
          <Button onClick={handleCreateAttribute}>Create Attribute</Button>
        </div>

        <AttributeListView
          attributes={attributes}
          onEdit={handleEditAttribute}
          onPreview={handlePreviewAttribute}
          onRefresh={refresh}
        />

        {showCreateModal && (
          <AttributeFormModal
            attribute={editingAttribute}
            onClose={handleModalClose}
            onSuccess={handleModalClose}
          />
        )}

        {previewingAttribute && (
          <AttributePreviewModal
            attribute={previewingAttribute}
            onClose={handlePreviewClose}
          />
        )}
      </div>
    </AdminProtection>
  );
}
