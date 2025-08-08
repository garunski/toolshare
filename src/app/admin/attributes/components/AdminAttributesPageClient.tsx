"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminProtection } from "@/admin/components/AdminProtection";
import { Button } from "@/primitives/button";
import { Heading } from "@/primitives/heading";
import type { AttributeDefinition } from "@/types/categories";

import { AttributeFormModal } from "./AttributeFormModal";
import { AttributeListView } from "./AttributeListView";
import { AttributePreviewModal } from "./AttributePreviewModal";

interface AdminAttributesPageClientProps {
  attributes: AttributeDefinition[];
}

export function AdminAttributesPageClient({
  attributes,
}: AdminAttributesPageClientProps) {
  const router = useRouter();
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
    router.refresh(); // Refresh server data
  };

  const handlePreviewClose = () => {
    setPreviewingAttribute(null);
  };

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
          onRefresh={() => router.refresh()}
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
