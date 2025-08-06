"use client";

import { TrashIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";

interface CategoryAttribute {
  attribute_definition_id: string;
  is_required: boolean;
  display_order: number;
  attribute: any;
}

interface Props {
  categoryAttributes: CategoryAttribute[];
  onRemoveAttribute: (attributeId: string) => void;
}

export function AssignedAttributesList({
  categoryAttributes,
  onRemoveAttribute,
}: Props) {
  if (categoryAttributes.length === 0) {
    return (
      <div className="max-h-96 space-y-2 overflow-y-auto">
        <p className="text-sm text-gray-500">No attributes assigned</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 space-y-2 overflow-y-auto">
      {categoryAttributes.map((catAttr) => (
        <div
          key={catAttr.attribute_definition_id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium">
                {catAttr.attribute.display_label}
              </span>
              <Badge color="zinc">{catAttr.attribute.data_type}</Badge>
              {catAttr.is_required && <Badge color="red">Required</Badge>}
            </div>
          </div>

          <Button
            outline
            onClick={() => onRemoveAttribute(catAttr.attribute_definition_id)}
            className="text-red-600 hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
