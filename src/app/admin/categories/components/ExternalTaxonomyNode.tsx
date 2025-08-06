"use client";

import {
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import type { ExternalTaxonomyNode } from "@/types/categories";

interface Props {
  node: ExternalTaxonomyNode;
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
  isSelected: boolean;
  onToggleExpanded: (nodeId: number) => void;
  onSelectCategory?: (category: ExternalTaxonomyNode) => void;
}

export function ExternalTaxonomyNode({
  node,
  depth,
  isExpanded,
  hasChildren,
  isSelected,
  onToggleExpanded,
  onSelectCategory,
}: Props) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div
        className={`flex cursor-pointer items-center justify-between p-3 hover:bg-gray-50 ${
          isSelected ? "border-l-4 border-blue-500 bg-blue-50" : ""
        }`}
        onClick={() => onSelectCategory?.(node)}
      >
        <div className="flex flex-1 items-center space-x-3">
          <div style={{ marginLeft: `${depth * 20}px` }}></div>

          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpanded(node.external_id);
              }}
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

          <FolderIcon className="h-5 w-5 text-gray-400" />

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="truncate font-medium">{node.category_path}</span>
              <Badge color="zinc">Level {node.level}</Badge>
              <Badge color="blue">ID: {node.external_id}</Badge>
            </div>
            {node.parent_id && (
              <p className="truncate text-sm text-gray-500">
                Parent: {node.parent_id}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onSelectCategory && (
            <Button
              outline
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onSelectCategory(node);
              }}
            >
              <PlusIcon className="h-4 w-4" />
              Select
            </Button>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="ml-6 border-l border-gray-200">
          {node.children!.map((child) => (
            <ExternalTaxonomyNode
              key={child.external_id}
              node={child}
              depth={depth + 1}
              isExpanded={false}
              hasChildren={Boolean(child.children && child.children.length > 0)}
              isSelected={false}
              onToggleExpanded={onToggleExpanded}
              onSelectCategory={onSelectCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
