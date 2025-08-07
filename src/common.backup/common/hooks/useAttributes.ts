import { useCallback, useEffect, useState } from "react";

import { AttributeOperations } from "@/common/operations/attributeOperations";
import type {
  AttributeCreationRequest,
  AttributeDefinition,
  AttributeUpdateRequest,
} from "@/types/categories";

export function useAttributes() {
  const [attributes, setAttributes] = useState<AttributeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAttributes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AttributeOperations.getAllAttributes();
      setAttributes(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load attributes",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createAttribute = useCallback(
    async (attributeData: AttributeCreationRequest) => {
      try {
        setError(null);
        const newAttribute =
          await AttributeOperations.createAttribute(attributeData);
        setAttributes((prev) => [...prev, newAttribute]);
        return newAttribute;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create attribute";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [],
  );

  const updateAttribute = useCallback(
    async (updateData: AttributeUpdateRequest) => {
      try {
        setError(null);
        const updatedAttribute =
          await AttributeOperations.updateAttribute(updateData);
        setAttributes((prev) =>
          prev.map((attr) =>
            attr.id === updateData.id ? updatedAttribute : attr,
          ),
        );
        return updatedAttribute;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update attribute";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [],
  );

  const deleteAttribute = useCallback(async (attributeId: string) => {
    try {
      setError(null);
      await AttributeOperations.deleteAttribute(attributeId);
      setAttributes((prev) => prev.filter((attr) => attr.id !== attributeId));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete attribute";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    loadAttributes();
  }, [loadAttributes]);

  return {
    attributes,
    loading,
    error,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    refresh: loadAttributes,
  };
}
