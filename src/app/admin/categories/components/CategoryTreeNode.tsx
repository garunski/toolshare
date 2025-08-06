"use client";

import {
  ChevronDownIcon,
  ChevronRightIcon,
  CogIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import type { CategoryTreeNode as CategoryTreeNodeType } from "@/types/categories";

interface Props {
  node: CategoryTreeNodeType;
  isExpanded: boolean;
  hasChildren: boolean;
  isDeleting: boolean;
  onToggleExpanded: (nodeId: string) => void;
  onEdit: (category: any) => void;
  onManageAttributes: (category: any) => void;
  onDelete: (category: CategoryTreeNodeType) => void;
}

export function CategoryTreeNode({
  node,
  isExpanded,
  hasChildren,
  isDeleting,
  onToggleExpanded,
  onEdit,
  onManageAttributes,
  onDelete,
}: Props) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between p-4 hover:bg-gray-50">
        <div className="flex items-center space-x-3">
          {hasChildren ? (
            <button
              onClick={() => onToggleExpanded(node.id)}
              className="rounded p-1 hover:bg-gray-200"
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6"></div>
          )}

          <div
            className="h-4 w-4 rounded"
            style={{ backgroundColor: node.color || "#6b7280" }}
          ></div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{node.name}</span>
              <Badge color="zinc">{node.slug}</Badge>
            </div>
            {node.level > 0 && (
              <div className="mt-1 text-sm text-gray-500">
                Level {node.level} • {node.children?.length || 0} children
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            outline
            onClick={() => onManageAttributes(node)}
            disabled={isDeleting}
          >
            <CogIcon className="h-4 w-4" />
            Attributes
          </Button>
          <Button outline onClick={() => onEdit(node)} disabled={isDeleting}>
            <PencilIcon className="h-4 w-4" />
            Edit
          </Button>
          <Button outline onClick={() => onDelete(node)} disabled={isDeleting}>
            <TrashIcon className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="ml-6 border-l border-gray-200">
          {node.children?.map((child) => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              isExpanded={false}
              hasChildren={Boolean(child.children && child.children.length > 0)}
              isDeleting={isDeleting}
              onToggleExpanded={onToggleExpanded}
              onEdit={onEdit}
              onManageAttributes={onManageAttributes}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
