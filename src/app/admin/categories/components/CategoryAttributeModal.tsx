"use client";

import { Button } from "@/primitives/button";
import { Dialog } from "@/primitives/dialog";
import type { Category } from "@/types/categories";

import { useCategoryAttributes } from "../hooks/useCategoryAttributes";

import { AssignedAttributesList } from "./AssignedAttributesList";
import { AvailableAttributesList } from "./AvailableAttributesList";

interface Props {
  category: Category;
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryAttributeModal({
  category,
  onClose,
  onSuccess,
}: Props) {
  const {
    categoryAttributes,
    availableAttributes,
    loading,
    handleAddAttribute,
    handleRemoveAttribute,
  } = useCategoryAttributes(category);

  if (loading) {
    return (
      <Dialog open onClose={onClose} size="lg">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-1/3 rounded bg-gray-200"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded bg-gray-200"></div>
              ))}
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open onClose={onClose} size="lg">
      <div className="p-6">
        <h2 className="mb-6 text-lg font-semibold">
          Manage Attributes for &quot;{category.name}&quot;
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="mb-4 font-medium">Assigned Attributes</h3>
            <AssignedAttributesList
              categoryAttributes={categoryAttributes}
              onRemoveAttribute={handleRemoveAttribute}
            />
          </div>

          <div>
            <h3 className="mb-4 font-medium">Available Attributes</h3>
            <AvailableAttributesList
              availableAttributes={availableAttributes}
              onAddAttribute={handleAddAttribute}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 border-t pt-6">
          <Button outline onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
