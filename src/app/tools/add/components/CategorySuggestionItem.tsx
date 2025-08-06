"use client";

import { CheckCircleIcon } from "@heroicons/react/24/outline";

import { Badge } from "@/primitives/badge";

interface CategorySuggestion {
  external_id: number;
  category_path: string;
  confidence: number;
  reasons: string[];
  level: number;
}

interface Props {
  suggestion: CategorySuggestion;
  isSelected: boolean;
  onSelect: () => void;
}

export function CategorySuggestionItem({
  suggestion,
  isSelected,
  onSelect,
}: Props) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "green";
    if (confidence >= 60) return "blue";
    if (confidence >= 40) return "yellow";
    return "zinc";
  };

  return (
    <div
      className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center space-x-2">
            <h4 className="font-medium text-gray-900">
              {suggestion.category_path.split(" > ").pop()}
            </h4>
            {isSelected && (
              <CheckCircleIcon className="h-4 w-4 text-blue-500" />
            )}
          </div>

          <p className="mb-2 text-xs text-gray-600">
            {suggestion.category_path}
          </p>

          {suggestion.reasons.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {suggestion.reasons.slice(0, 2).map((reason, index) => (
                <Badge key={index} color="zinc">
                  {reason}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Badge
          className="ml-2"
          color={getConfidenceColor(suggestion.confidence)}
        >
          {Math.round(suggestion.confidence)}%
        </Badge>
      </div>
    </div>
  );
}
