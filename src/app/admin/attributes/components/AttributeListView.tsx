"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { AttributeOperations } from "@/common/operations/attributeOperations";
import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";
import type { AttributeDefinition } from "@/types/categories";

import { AttributeCard } from "./AttributeCard";

interface Props {
  attributes: AttributeDefinition[];
  onEdit: (attribute: AttributeDefinition) => void;
  onPreview: (attribute: AttributeDefinition) => void;
  onRefresh: () => void;
}

export function AttributeListView({
  attributes,
  onEdit,
  onPreview,
  onRefresh,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (attribute: AttributeDefinition) => {
    if (
      !confirm(
        `Are you sure you want to delete "${attribute.display_label}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingId(attribute.id);
    try {
      await AttributeOperations.deleteAttribute(attribute.id);
      onRefresh();
    } catch (error) {
      alert(
        `Failed to delete attribute: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAttributes = attributes.filter(
    (attr) =>
      !searchTerm ||
      attr.display_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attr.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (attributes.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow">
        <div className="mb-4">
          <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-300" />
        </div>
        <p className="text-gray-500">
          No attributes found. Create your first attribute to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-4 shadow">
        <Input
          placeholder="Search attributes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAttributes.map((attribute) => (
          <AttributeCard
            key={attribute.id}
            attribute={attribute}
            onEdit={onEdit}
            onPreview={onPreview}
            onDelete={handleDelete}
            isDeleting={deletingId === attribute.id}
          />
        ))}
      </div>

      {filteredAttributes.length === 0 && attributes.length > 0 && (
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <p className="text-gray-500">
            No attributes match your search criteria.
          </p>
          <Button outline onClick={() => setSearchTerm("")} className="mt-2">
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
}
