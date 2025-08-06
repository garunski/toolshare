'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, FolderIcon } from '@heroicons/react/24/outline';

import { Input } from '@/primitives/input';

import { CategoryItem } from './CategoryItem';

interface ExternalCategory {
  external_id: number;
  category_path: string;
  parent_id: number | null;
  level: number;
  is_active: boolean;
  last_updated: string;
  children?: ExternalCategory[];
}

interface Props {
  categories: ExternalCategory[];
  selectedCategoryId: number | null;
  onCategorySelect: (categoryId: number) => void;
}

export function CategorySelector({ categories, selectedCategoryId, onCategorySelect }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const toggleExpanded = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filterCategories = (categories: ExternalCategory[]): ExternalCategory[] => {
    if (!searchTerm) return categories;

    return categories.filter(category => {
      const matchesSearch = category.category_path.toLowerCase().includes(searchTerm.toLowerCase());
      const childMatches = category.children ? filterCategories(category.children).length > 0 : false;
      
      return matchesSearch || childMatches;
    }).map(category => ({
      ...category,
      children: category.children ? filterCategories(category.children) : undefined
    }));
  };

  const filteredCategories = filterCategories(categories);

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No categories available. Please contact an administrator.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Select Item Category</h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose the category that best describes your item. This will determine what additional information you&apos;ll need to provide.
        </p>

        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No categories match your search.</p>
          </div>
        ) : (
          filteredCategories.map(category => (
            <CategoryItem
              key={category.external_id}
              category={category}
              depth={0}
              isSelected={selectedCategoryId === category.external_id}
              isExpanded={expandedCategories.has(category.external_id)}
              onSelect={onCategorySelect}
              onToggleExpanded={toggleExpanded}
            />
          ))
        )}
      </div>

      {selectedCategoryId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-900">
              Category selected: {categories.find(c => c.external_id === selectedCategoryId)?.category_path.split(' > ').pop()}
            </span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            You can proceed to the next step to provide basic information about your item.
          </p>
        </div>
      )}
    </div>
  );
} 