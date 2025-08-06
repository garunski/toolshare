"use client";

import { PlusIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";

interface Props {
  availableAttributes: any[];
  onAddAttribute: (attributeId: string) => void;
}

export function AvailableAttributesList({
  availableAttributes,
  onAddAttribute,
}: Props) {
  if (availableAttributes.length === 0) {
    return (
      <div className="max-h-96 space-y-2 overflow-y-auto">
        <p className="text-sm text-gray-500">No more attributes available</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 space-y-2 overflow-y-auto">
      {availableAttributes.map((attr) => (
        <div
          key={attr.id}
          className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{attr.display_label}</span>
              <Badge color="zinc">{attr.data_type}</Badge>
            </div>
          </div>

          <Button onClick={() => onAddAttribute(attr.id)}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
