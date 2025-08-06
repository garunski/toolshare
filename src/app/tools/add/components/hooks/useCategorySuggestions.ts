import { useEffect, useState } from "react";

import { CategorySuggestionEngine } from "@/common/operations/categorySuggestionEngine";

interface CategorySuggestion {
  external_id: number;
  category_path: string;
  confidence: number;
  reasons: string[];
  level: number;
}

export function useCategorySuggestions(
  itemName: string,
  itemDescription: string | undefined,
  attributes: Record<string, any> | undefined,
  tags: string[] | undefined,
  selectedCategoryId: number | null | undefined,
  onCategorySelect: (categoryId: number) => void,
) {
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoSelected, setAutoSelected] = useState(false);

  useEffect(() => {
    if (!itemName.trim()) {
      setSuggestions([]);
      return;
    }

    const getSuggestions = async () => {
      setLoading(true);
      try {
        const result = await CategorySuggestionEngine.suggestCategories({
          name: itemName,
          description: itemDescription,
          attributes,
          tags,
          existingCategory: selectedCategoryId || undefined,
        });

        setSuggestions(result);

        // Auto-select if high confidence and no current selection
        if (
          !selectedCategoryId &&
          result.length > 0 &&
          result[0].confidence > 80
        ) {
          onCategorySelect(result[0].external_id);
          setAutoSelected(true);
        }
      } catch (error) {
        console.error("Failed to get category suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(getSuggestions, 500);
    return () => clearTimeout(debounceTimer);
  }, [
    itemName,
    itemDescription,
    attributes,
    tags,
    selectedCategoryId,
    onCategorySelect,
  ]);

  return { suggestions, loading, autoSelected };
}
