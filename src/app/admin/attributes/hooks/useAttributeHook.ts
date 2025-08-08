import { useCallback, useEffect, useState } from "react";

import { AttributeOperations } from "@/common/operations/attributeOperations";
import type { AttributeDefinition } from "@/types/categories";

export function useAttribute(attributeId: string) {
  const [attribute, setAttribute] = useState<AttributeDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAttribute = useCallback(async () => {
    if (!attributeId) {
      setAttribute(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await AttributeOperations.getAttributeById(attributeId);
      setAttribute(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load attribute");
    } finally {
      setLoading(false);
    }
  }, [attributeId]);

  useEffect(() => {
    loadAttribute();
  }, [loadAttribute]);

  return {
    attribute,
    loading,
    error,
    refresh: loadAttribute,
  };
}
