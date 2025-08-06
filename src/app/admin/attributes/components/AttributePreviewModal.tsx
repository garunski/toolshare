"use client";

import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import { Dialog } from "@/primitives/dialog";
import type { AttributeDefinition } from "@/types/categories";

import { AttributeFieldPreview } from "./AttributeFieldPreview";

interface Props {
  attribute: AttributeDefinition;
  onClose: () => void;
}

export function AttributePreviewModal({ attribute, onClose }: Props) {
  return (
    <Dialog open onClose={onClose} size="lg">
      <div className="p-6">
        <h2 className="mb-6 text-lg font-semibold">
          Attribute Preview: {attribute.display_label}
        </h2>

        <div className="space-y-6">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Internal Name:</span>{" "}
                {attribute.name}
              </div>
              <div>
                <span className="font-medium">Data Type:</span>
                <Badge className="ml-2" color="zinc">
                  {attribute.data_type}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Required:</span>{" "}
                {attribute.is_required ? "Yes" : "No"}
              </div>
              <div>
                <span className="font-medium">Display Order:</span>{" "}
                {attribute.display_order}
              </div>
            </div>

            {attribute.description && (
              <div className="mt-3">
                <span className="text-sm font-medium">Description:</span>
                <p className="mt-1 text-sm text-gray-600">
                  {attribute.description}
                </p>
              </div>
            )}

            {attribute.help_text && (
              <div className="mt-3">
                <span className="text-sm font-medium">Help Text:</span>
                <p className="mt-1 text-sm text-gray-600">
                  {attribute.help_text}
                </p>
              </div>
            )}

            {attribute.default_value && (
              <div className="mt-3">
                <span className="text-sm font-medium">Default Value:</span>
                <span className="ml-2 text-sm text-gray-600">
                  {attribute.default_value}
                </span>
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-3 font-medium">How this field will appear:</h3>
            <div className="rounded-lg border bg-white p-4">
              <label className="mb-2 block text-sm font-medium">
                {attribute.display_label}
                {attribute.is_required && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </label>
              <AttributeFieldPreview attribute={attribute} />
              {attribute.help_text && (
                <p className="mt-1 text-xs text-gray-500">
                  {attribute.help_text}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t pt-6">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Dialog>
  );
}
