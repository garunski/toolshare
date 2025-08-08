/* eslint-disable max-lines */
import { useEffect, useState } from "react";

import type { AttributeDefinition, Category } from "@/types/categories";

interface CategoryAttribute {
  attribute_definition_id: string;
  is_required: boolean;
  display_order: number;
  attribute: any;
}

export function useCategoryAttributes(category: Category) {
  const [allAttributes, setAllAttributes] = useState<AttributeDefinition[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<
    CategoryAttribute[]
  >([]);
  const [availableAttributes, setAvailableAttributes] = useState<
    AttributeDefinition[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all attributes first
        const attributesResponse = await fetch(
          "/api/admin/taxonomy/attributes",
        );
        if (!attributesResponse.ok) {
          throw new Error("Failed to load attributes");
        }
        const attributes = await attributesResponse.json();
        setAllAttributes(attributes);

        // Load category attributes
        const categoryResponse = await fetch(
          `/api/admin/taxonomy/categories?id=${category.id}`,
        );

        if (!categoryResponse.ok) {
          throw new Error("Failed to load category attributes");
        }

        const categoryWithAttrs = await categoryResponse.json();

        if (categoryWithAttrs) {
          const attrs = categoryWithAttrs.attributes.map((attr: any) => ({
            attribute_definition_id: attr.id,
            is_required: attr.is_required,
            display_order: attr.display_order,
            attribute: attr,
          }));
          setCategoryAttributes(attrs);

          const assignedIds = new Set(
            attrs.map((ca: any) => ca.attribute_definition_id),
          );
          setAvailableAttributes(
            attributes.filter(
              (attr: AttributeDefinition) => !assignedIds.has(attr.id),
            ),
          );
        } else {
          // If no attributes are assigned to this category, all attributes are available
          setCategoryAttributes([]);
          setAvailableAttributes(attributes as AttributeDefinition[]);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [category.id]);

  const handleAddAttribute = async (attributeId: string) => {
    try {
      const response = await fetch(
        "/api/admin/taxonomy/categories/attributes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category_id: category.id,
            attribute_definition_id: attributeId,
            is_required: false,
            display_order: categoryAttributes.length,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to add attribute to category");
      }

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
      const response = await fetch(
        `/api/admin/taxonomy/categories/attributes?categoryId=${category.id}&attributeId=${attributeId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to remove attribute from category");
      }

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
