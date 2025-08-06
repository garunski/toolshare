import { Badge } from "@/primitives/badge";
import type { CategoryTreeNode } from "@/types/categories";

interface CategoryStatItemProps {
  stat: {
    category_name: string;
    count: number;
    percentage: number;
  };
  category?: CategoryTreeNode;
  index: number;
}

export function CategoryStatItem({ stat, category, index }: CategoryStatItemProps) {
  const getProgressBarColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-gray-500",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex w-32 flex-shrink-0 items-center space-x-2">
        {category && (
          <div
            className="h-3 w-3 rounded-full"
            style={{
              backgroundColor: category.color || "#6b7280",
            }}
          />
        )}
        <span className="truncate text-sm font-medium">
          {stat.category_name}
        </span>
      </div>

      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between">
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full ${getProgressBarColor(index)}`}
              style={{ width: `${Math.max(stat.percentage, 2)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex w-20 items-center justify-end space-x-2">
        <span className="text-sm font-medium">{stat.count}</span>
        <span className="text-xs text-gray-500">
          ({stat.percentage.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
} 