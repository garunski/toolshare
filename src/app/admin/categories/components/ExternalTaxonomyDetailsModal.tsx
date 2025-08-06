"use client";

import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import { Dialog } from "@/primitives/dialog";
import type { ExternalTaxonomyNode } from "@/types/categories";

interface Props {
  category: ExternalTaxonomyNode | null;
  open: boolean;
  onClose: () => void;
}

export function ExternalTaxonomyDetailsModal({
  category,
  open,
  onClose,
}: Props) {
  if (!category) return null;

  return (
    <Dialog open={open} onClose={onClose} size="lg">
      <div className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Category Details</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category Path
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {category.category_path}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                External ID
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {category.external_id}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Level
              </label>
              <p className="mt-1 text-sm text-gray-900">{category.level}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Parent ID
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {category.parent_id || "Root Category"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="mt-1">
                <Badge color={category.is_active ? "green" : "red"}>
                  {category.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Updated
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(category.last_updated).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 border-t pt-6">
          <Button outline onClick={onClose}>
            Close
          </Button>
          <Button>Import to Local Categories</Button>
        </div>
      </div>
    </Dialog>
  );
}
