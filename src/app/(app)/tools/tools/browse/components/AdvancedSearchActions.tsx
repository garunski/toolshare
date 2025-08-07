import {
  BookmarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import { Badge } from "@/primitives/badge";
import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";

interface SearchActionsProps {
  query: string;
  onQueryChange: (query: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onShowSaveModal: () => void;
  activeFilterCount: number;
}

export function SearchActions({
  query,
  onQueryChange,
  showFilters,
  onToggleFilters,
  onShowSaveModal,
  activeFilterCount,
}: SearchActionsProps) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search items..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button onClick={onToggleFilters} className="flex items-center gap-2">
        <FunnelIcon className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <Badge className="ml-1">{activeFilterCount}</Badge>
        )}
      </Button>
      <Button onClick={onShowSaveModal} className="flex items-center gap-2">
        <BookmarkIcon className="h-4 w-4" />
        Save
      </Button>
    </div>
  );
}
