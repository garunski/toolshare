"use client";

import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import type { AttributeDefinition } from "@/types/categories";

interface Props {
  attribute: AttributeDefinition;
  onEdit: (attribute: AttributeDefinition) => void;
  onPreview: (attribute: AttributeDefinition) => void;
  onDelete: (attribute: AttributeDefinition) => void;
  isDeleting: boolean;
}

const DATA_TYPE_COLORS = {
  text: "bg-blue-100 text-blue-800",
  number: "bg-green-100 text-green-800",
  boolean: "bg-purple-100 text-purple-800",
  date: "bg-yellow-100 text-yellow-800",
  select: "bg-orange-100 text-orange-800",
  multi_select: "bg-red-100 text-red-800",
  url: "bg-indigo-100 text-indigo-800",
  email: "bg-pink-100 text-pink-800",
};

export function AttributeCard({
  attribute,
  onEdit,
  onPreview,
  onDelete,
  isDeleting,
}: Props) {
  return (
    <div className="rounded-lg bg-white shadow transition-shadow hover:shadow-md">
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              {attribute.display_label}
            </h3>
            <p className="mb-2 text-sm text-gray-500">{attribute.name}</p>
          </div>
          <Badge
            className={
              DATA_TYPE_COLORS[
                attribute.data_type as keyof typeof DATA_TYPE_COLORS
              ]
            }
          >
            {attribute.data_type}
          </Badge>
        </div>

        {attribute.description && (
          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
            {attribute.description}
          </p>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {attribute.is_required && <Badge color="red">Required</Badge>}
          {attribute.is_searchable && <Badge color="zinc">Searchable</Badge>}
          {attribute.is_filterable && <Badge color="zinc">Filterable</Badge>}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Order: {attribute.display_order}
          </div>
          <div className="flex space-x-2">
            <Button outline onClick={() => onPreview(attribute)}>
              <EyeIcon className="h-4 w-4" />
            </Button>
            <Button outline onClick={() => onEdit(attribute)}>
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              outline
              onClick={() => onDelete(attribute)}
              disabled={isDeleting}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              {isDeleting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
              ) : (
                <TrashIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
