'use client';

import { FolderIcon } from '@heroicons/react/24/outline';

import { Badge } from '@/primitives/badge';

interface ExternalCategory {
  external_id: number;
  category_path: string;
  parent_id: number | null;
  level: number;
  is_active: boolean;
  last_updated: string;
  children?: ExternalCategory[];
}

interface CategoryItemProps {
  category: ExternalCategory;
  depth: number;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (categoryId: number) => void;
  onToggleExpanded: (categoryId: number) => void;
}

export function CategoryItem({ category, depth, isSelected, isExpanded, onSelect, onToggleExpanded }: CategoryItemProps) {
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? 'bg-blue-50 border-2 border-blue-200'
            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
        }`}
        style={{ marginLeft: depth * 20 }}
        onClick={() => onSelect(category.external_id)}
      >
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpanded(category.external_id);
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

            <FolderIcon className="h-5 w-5 text-gray-400" />

            <div>
              <h3 className="font-medium text-gray-900">
                {category.category_path.split(' > ').pop()}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{category.category_path}</p>
            </div>
          </div>

          {depth > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              ID: {category.external_id}
            </div>
          )}
        </div>

        {isSelected && (
          <div className="ml-4">
            <Badge color="blue">Selected</Badge>
          </div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2">
          {category.children!.map(child => (
            <CategoryItem
              key={child.external_id}
              category={child}
              depth={depth + 1}
              isSelected={false}
              isExpanded={false}
              onSelect={onSelect}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
} 