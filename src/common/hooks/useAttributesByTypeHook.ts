import { useCallback, useEffect, useState } from "react";

import { AttributeOperations } from "@/common/operations/attributeOperations";
import type { AttributeDefinition } from "@/types/categories";

export function useAttributesByType(dataType: string) {
  const [attributes, setAttributes] = useState<AttributeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAttributes = useCallback(async () => {
    if (!dataType) {
      setAttributes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await AttributeOperations.getAttributesByType(dataType);
      setAttributes(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load attributes",
      );
    } finally {
      setLoading(false);
    }
  }, [dataType]);

  useEffect(() => {
    loadAttributes();
  }, [loadAttributes]);

  return {
    attributes,
    loading,
    error,
    refresh: loadAttributes,
  };
}
