# Item Administration

## Admin Oversight of All Items

### 1. Item Administration Page
- [ ] Create: `src/app/admin/items/page.tsx` (under 150 lines)

```tsx
// src/app/admin/items/page.tsx
'use client';

import { useState, useMemo } from 'react';
import { Heading } from '@/primitives/heading';
import { AdminProtection } from '@/app/admin/components/AdminProtection';
import { ItemsListView } from './components/ItemsListView';
import { ItemFilters } from './components/ItemFilters';
import { ItemBulkActions } from './components/ItemBulkActions';
import { ItemMigrationTools } from './components/ItemMigrationTools';
import { ItemQualityReport } from './components/ItemQualityReport';
import { useItems } from '@/common/hooks/useItems';
import type { ItemSearchFilters } from '@/types/item';

export default function AdminItemsPage() {
  const [filters, setFilters] = useState<ItemSearchFilters>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'migration' | 'quality'>('items');
  
  const { items, loading, error, searchItems, hasMore, loadMore } = useItems(filters);

  const handleFiltersChange = (newFilters: ItemSearchFilters) => {
    setFilters(newFilters);
    setSelectedItems([]);
    searchItems(newFilters);
  };

  const handleItemSelect = (itemId: string, selected: boolean) => {
    setSelectedItems(prev => 
      selected 
        ? [...prev, itemId]
        : prev.filter(id => id !== itemId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedItems(selected ? items.map(item => item.id) : []);
  };

  const handleBulkActionComplete = () => {
    setSelectedItems([]);
    searchItems(filters);
  };

  const tabs = [
    { id: 'items' as const, label: 'Items Management', count: items.length },
    { id: 'migration' as const, label: 'Migration Tools', count: null },
    { id: 'quality' as const, label: 'Data Quality', count: null }
  ];

  if (error) {
    return (
      <AdminProtection>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Error loading items: {error}</p>
          </div>
        </div>
      </AdminProtection>
    );
  }

  return (
    <AdminProtection>
      <div className="p-6">
        <div className="mb-6">
          <Heading level={1}>Item Administration</Heading>
          <p className="text-gray-600 mt-1">
            Manage and oversee all items in the system
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            <ItemFilters onFiltersChange={handleFiltersChange} />
            
            {selectedItems.length > 0 && (
              <ItemBulkActions
                selectedItems={selectedItems}
                onActionComplete={handleBulkActionComplete}
              />
            )}

            <ItemsListView
              items={items}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={loadMore}
              selectedItems={selectedItems}
              onItemSelect={handleItemSelect}
              onSelectAll={handleSelectAll}
            />
          </div>
        )}

        {activeTab === 'migration' && (
          <ItemMigrationTools />
        )}

        {activeTab === 'quality' && (
          <ItemQualityReport />
        )}
      </div>
    </AdminProtection>
  );
}
```

### 2. Items List View Component
- [ ] Create: `src/app/admin/items/components/ItemsListView.tsx` (under 150 lines)

```tsx
// src/app/admin/items/components/ItemsListView.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/primitives/button';
import { Badge } from '@/primitives/badge';
import { Checkbox } from '@/primitives/checkbox';
import { ItemDetailModal } from './ItemDetailModal';
import { CategoryFormatter } from '@/common/formatters/categoryFormatter';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ItemOperations } from '@/common/operations/itemOperations';
import type { ItemSearchResult } from '@/types/item';

interface Props {
  items: ItemSearchResult[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  selectedItems: string[];
  onItemSelect: (itemId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

const CONDITION_COLORS = {
  excellent: 'bg-green-100 text-green-800',
  good: 'bg-blue-100 text-blue-800',
  fair: 'bg-yellow-100 text-yellow-800',
  poor: 'bg-red-100 text-red-800'
};

export function ItemsListView({ 
  items, 
  loading, 
  hasMore, 
  onLoadMore, 
  selectedItems, 
  onItemSelect, 
  onSelectAll 
}: Props) {
  const [viewingItem, setViewingItem] = useState<ItemSearchResult | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (item: ItemSearchResult) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(item.id);
    try {
      await ItemOperations.deleteItem(item.id);
      // Refresh will be handled by parent
    } catch (error) {
      alert(`Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < items.length;

  if (loading && items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="animate-pulse p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No items found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={(checked) => onSelectAll(checked)}
            />
            <span className="text-sm font-medium">
              {selectedItems.length > 0 ? `${selectedItems.length} selected` : 'Select all'}
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {items.length} items shown
          </span>
        </div>
      </div>

      {/* Items List */}
      <div className="divide-y divide-gray-200">
        {items.map(item => (
          <div key={item.id} className="p-6 hover:bg-gray-50">
            <div className="flex items-center space-x-4">
              <Checkbox
                checked={selectedItems.includes(item.id)}
                onChange={(checked) => onItemSelect(item.id, checked)}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {item.name}
                  </h3>
                  <Badge className={CONDITION_COLORS[item.condition as keyof typeof CONDITION_COLORS]}>
                    {item.condition}
                  </Badge>
                  {!item.is_available && (
                    <Badge variant="secondary">Unavailable</Badge>
                  )}
                  {!item.is_public && (
                    <Badge variant="outline">Private</Badge>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Category: {item.category?.name || 'Unknown'}</span>
                  <span>Owner: {item.owner?.full_name || 'Unknown'}</span>
                  <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                </div>

                {item.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-2 flex space-x-2">
                    {item.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" size="sm">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="outline" size="sm">
                        +{item.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewingItem(item)}
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {/* Handle edit */}}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(item)}
                  disabled={deletingId === item.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {deletingId === item.id ? (
                    <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                  ) : (
                    <TrashIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <Button 
            variant="outline" 
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {/* Item Detail Modal */}
      {viewingItem && (
        <ItemDetailModal
          item={viewingItem}
          onClose={() => setViewingItem(null)}
        />
      )}
    </div>
  );
}
```

### 3. Item Filters Component
- [ ] Create: `src/app/admin/items/components/ItemFilters.tsx` (under 150 lines)

```tsx
// src/app/admin/items/components/ItemFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/primitives/input';
import { Select } from '@/primitives/select';
import { Button } from '@/primitives/button';
import { Badge } from '@/primitives/badge';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCategories } from '@/common/hooks/useCategories';
import type { ItemSearchFilters } from '@/types/item';

interface Props {
  onFiltersChange: (filters: ItemSearchFilters) => void;
}

export function ItemFilters({ onFiltersChange }: Props) {
  const { categories } = useCategories();
  const [filters, setFilters] = useState<ItemSearchFilters>({});
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange(filters);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, onFiltersChange]);

  const updateFilter = (key: keyof ItemSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFilterCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && 
    !(Array.isArray(value) && value.length === 0)
  ).length;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount} active</Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Less Filters' : 'More Filters'}
          </Button>
          {activeFilterCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearFilters}
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <Input
            placeholder="Search items..."
            value={filters.search_text || ''}
            onChange={(e) => updateFilter('search_text', e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
          />
        </div>

        {/* Category */}
        <div>
          <Select
            value={filters.category_id || ''}
            onChange={(e) => updateFilter('category_id', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Availability */}
        <div>
          <Select
            value={filters.is_available === undefined ? '' : filters.is_available.toString()}
            onChange={(e) => updateFilter('is_available', e.target.value === '' ? undefined : e.target.value === 'true')}
          >
            <option value="">All Items</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </Select>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <>
            {/* Condition */}
            <div>
              <Select
                value={filters.condition?.join(',') || ''}
                onChange={(e) => updateFilter('condition', e.target.value ? e.target.value.split(',') : undefined)}
              >
                <option value="">All Conditions</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Input
                placeholder="Location..."
                value={filters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
              />
            </div>

            {/* Tags */}
            <div>
              <Input
                placeholder="Tags (comma separated)..."
                value={filters.tags?.join(', ') || ''}
                onChange={(e) => updateFilter('tags', e.target.value ? e.target.value.split(',').map(t => t.trim()) : undefined)}
              />
            </div>

            {/* Date Range would go here if needed */}
            <div>
              <Select value="">
                <option value="">Created Date</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.search_text && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>Search: {filters.search_text}</span>
              <button onClick={() => updateFilter('search_text', '')}>
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.category_id && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>Category: {categories.find(c => c.id === filters.category_id)?.name}</span>
              <button onClick={() => updateFilter('category_id', '')}>
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.is_available !== undefined && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>{filters.is_available ? 'Available' : 'Unavailable'}</span>
              <button onClick={() => updateFilter('is_available', undefined)}>
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.condition && filters.condition.length > 0 && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <span>Condition: {filters.condition.join(', ')}</span>
              <button onClick={() => updateFilter('condition', undefined)}>
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
```

### 4. Item Bulk Actions Component
- [ ] Create: `src/app/admin/items/components/ItemBulkActions.tsx` (under 150 lines)

```tsx
// src/app/admin/items/components/ItemBulkActions.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/primitives/button';
import { Select } from '@/primitives/select';
import { Dialog } from '@/primitives/dialog';
import { useCategories } from '@/common/hooks/useCategories';
import { ItemOperations } from '@/common/operations/itemOperations';
import { TrashIcon, ArrowPathIcon, EyeSlashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Props {
  selectedItems: string[];
  onActionComplete: () => void;
}

type BulkAction = 'delete' | 'change-category' | 'set-availability' | 'set-visibility';

export function ItemBulkActions({ selectedItems, onActionComplete }: Props) {
  const { categories } = useCategories();
  const [action, setAction] = useState<BulkAction | ''>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState<boolean | null>(null);
  const [selectedVisibility, setSelectedVisibility] = useState<boolean | null>(null);

  const handleActionSelect = (selectedAction: BulkAction) => {
    setAction(selectedAction);
    setShowConfirmDialog(true);
  };

  const executeAction = async () => {
    if (!action) return;

    setProcessing(true);
    try {
      switch (action) {
        case 'delete':
          await Promise.all(
            selectedItems.map(itemId => ItemOperations.deleteItem(itemId))
          );
          break;

        case 'change-category':
          if (selectedCategory) {
            await ItemOperations.bulkUpdateItems(selectedItems, {
              category_id: selectedCategory
            });
          }
          break;

        case 'set-availability':
          if (selectedAvailability !== null) {
            await ItemOperations.bulkUpdateItems(selectedItems, {
              is_available: selectedAvailability
            });
          }
          break;

        case 'set-visibility':
          if (selectedVisibility !== null) {
            await ItemOperations.bulkUpdateItems(selectedItems, {
              is_public: selectedVisibility
            });
          }
          break;
      }

      onActionComplete();
      setShowConfirmDialog(false);
      setAction('');
    } catch (error) {
      alert(`Failed to perform bulk action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  const getActionTitle = () => {
    switch (action) {
      case 'delete':
        return 'Delete Items';
      case 'change-category':
        return 'Change Category';
      case 'set-availability':
        return 'Set Availability';
      case 'set-visibility':
        return 'Set Visibility';
      default:
        return 'Confirm Action';
    }
  };

  const getActionDescription = () => {
    const count = selectedItems.length;
    switch (action) {
      case 'delete':
        return `Are you sure you want to delete ${count} item${count > 1 ? 's' : ''}? This action cannot be undone.`;
      case 'change-category':
        const categoryName = categories.find(c => c.id === selectedCategory)?.name || 'Unknown';
        return `Change the category of ${count} item${count > 1 ? 's' : ''} to "${categoryName}"?`;
      case 'set-availability':
        return `Set ${count} item${count > 1 ? 's' : ''} as ${selectedAvailability ? 'available' : 'unavailable'}?`;
      case 'set-visibility':
        return `Set ${count} item${count > 1 ? 's' : ''} as ${selectedVisibility ? 'public' : 'private'}?`;
      default:
        return '';
    }
  };

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-blue-900">
              {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleActionSelect('set-availability')}
              onMouseEnter={() => setSelectedAvailability(true)}
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              Make Available
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleActionSelect('set-availability')}
              onMouseEnter={() => setSelectedAvailability(false)}
            >
              <EyeSlashIcon className="h-4 w-4 mr-1" />
              Make Unavailable
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleActionSelect('change-category')}
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Change Category
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleActionSelect('delete')}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">{getActionTitle()}</h2>

          <p className="text-gray-600 mb-6">{getActionDescription()}</p>

          {/* Additional inputs for specific actions */}
          {action === 'change-category' && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Category</label>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Choose a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={executeAction}
              disabled={processing || (action === 'change-category' && !selectedCategory)}
              className={action === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {processing ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
```

### 5. Item Detail Modal
- [ ] Create: `src/app/admin/items/components/ItemDetailModal.tsx` (under 150 lines)

```tsx
// src/app/admin/items/components/ItemDetailModal.tsx
'use client';

import { Dialog } from '@/primitives/dialog';
import { Badge } from '@/primitives/badge';
import { Button } from '@/primitives/button';
import type { ItemSearchResult } from '@/types/item';

interface Props {
  item: ItemSearchResult;
  onClose: () => void;
}

export function ItemDetailModal({ item, onClose }: Props) {
  const formatAttributeValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === '') {
      return 'Not specified';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    return String(value);
  };

  return (
    <Dialog open onClose={onClose} size="xl">
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="text-gray-600 mt-1">Item Details</p>
          </div>
          <div className="flex space-x-2">
            <Badge className={`${
              item.condition === 'excellent' ? 'bg-green-100 text-green-800' :
              item.condition === 'good' ? 'bg-blue-100 text-blue-800' :
              item.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {item.condition}
            </Badge>
            {!item.is_available && <Badge variant="secondary">Unavailable</Badge>}
            {!item.is_public && <Badge variant="outline">Private</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div>
            <h3 className="font-medium mb-4">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Category:</span>
                <p className="mt-1">{item.category?.name || 'Unknown'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Owner:</span>
                <p className="mt-1">{item.owner?.full_name || 'Unknown'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Location:</span>
                <p className="mt-1">{item.location || 'Not specified'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Created:</span>
                <p className="mt-1">{new Date(item.created_at).toLocaleString()}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Last Updated:</span>
                <p className="mt-1">{new Date(item.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Status & Settings */}
          <div>
            <h3 className="font-medium mb-4">Status & Settings</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Available:</span>
                <p className="mt-1">{item.is_available ? 'Yes' : 'No'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Shareable:</span>
                <p className="mt-1">{item.is_shareable ? 'Yes' : 'No'}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600">Public:</span>
                <p className="mt-1">{item.is_public ? 'Yes' : 'No'}</p>
              </div>
              
              {item.tags && item.tags.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Tags:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.tags.map(tag => (
                      <Badge key={tag} variant="outline" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div className="mt-8">
            <h3 className="font-medium mb-4">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
          </div>
        )}

        {/* Dynamic Attributes */}
        {item.attributes && Object.keys(item.attributes).length > 0 && (
          <div className="mt-8">
            <h3 className="font-medium mb-4">Attributes</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(item.attributes).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <p className="mt-1 text-sm">{formatAttributeValue(key, value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Images */}
        {item.images && item.images.length > 0 && (
          <div className="mt-8">
            <h3 className="font-medium mb-4">Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {item.images.slice(0, 8).map((image, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${item.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t mt-8">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Dialog>
  );
}
```

## Success Criteria
- [ ] Item administration interface fully functional
- [ ] Comprehensive item filtering and search working
- [ ] Bulk operations for item management implemented
- [ ] Item detail view showing all information properly
- [ ] Migration tools and data quality reporting available
- [ ] All files under 150 lines with proper imports 