import { useEffect, useState } from "react";

import { useAttributes } from "@/common/hooks/useAttributes";
import { CategoryOperations } from "@/common/operations/categoryOperations";
import { createClient } from "@/common/supabase/client";
import type { Category } from "@/types/categories";

interface CategoryAttribute {
  attribute_definition_id: string;
  is_required: boolean;
  display_order: number;
  attribute: any;
}

export function useCategoryAttributes(category: Category) {
  const { attributes: allAttributes } = useAttributes();
  const [categoryAttributes, setCategoryAttributes] = useState<
    CategoryAttribute[]
  >([]);
  const [availableAttributes, setAvailableAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryAttributes = async () => {
      try {
        const categoryWithAttrs =
          await CategoryOperations.getCategoryWithAttributes(category.id);
        if (categoryWithAttrs) {
          const attrs = categoryWithAttrs.attributes.map((attr) => ({
            attribute_definition_id: attr.id,
            is_required: attr.is_required,
            display_order: attr.display_order,
            attribute: attr,
          }));
          setCategoryAttributes(attrs);

          const assignedIds = new Set(
            attrs.map((ca) => ca.attribute_definition_id),
          );
          setAvailableAttributes(
            allAttributes.filter((attr) => !assignedIds.has(attr.id)),
          );
        } else {
          // If no attributes are assigned to this category, all attributes are available
          setCategoryAttributes([]);
          setAvailableAttributes(allAttributes);
        }
      } catch (error) {
        console.error("Failed to load category attributes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryAttributes();
  }, [category.id, allAttributes]);

  const handleAddAttribute = async (attributeId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from("category_attributes").insert({
        category_id: category.id,
        attribute_definition_id: attributeId,
        is_required: false,
        display_order: categoryAttributes.length,
      });

      if (error) throw error;

      const attribute = allAttributes.find((attr) => attr.id === attributeId);
      if (attribute) {
        setCategoryAttributes((prev) => [
          ...prev,
          {
            attribute_definition_id: attributeId,
            is_required: false,
            display_order: prev.length,
            attribute,
          },
        ]);

        setAvailableAttributes((prev) =>
          prev.filter((attr) => attr.id !== attributeId),
        );
      }
    } catch (error) {
      alert(
        `Failed to add attribute: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleRemoveAttribute = async (attributeId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("category_attributes")
        .delete()
        .eq("category_id", category.id)
        .eq("attribute_definition_id", attributeId);

      if (error) throw error;

      const removedAttribute = categoryAttributes.find(
        (ca) => ca.attribute_definition_id === attributeId,
      );

      setCategoryAttributes((prev) =>
        prev.filter((ca) => ca.attribute_definition_id !== attributeId),
      );

      if (removedAttribute) {
        setAvailableAttributes((prev) => [...prev, removedAttribute.attribute]);
      }
    } catch (error) {
      alert(
        `Failed to remove attribute: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return {
    categoryAttributes,
    availableAttributes,
    loading,
    handleAddAttribute,
    handleRemoveAttribute,
  };
}
