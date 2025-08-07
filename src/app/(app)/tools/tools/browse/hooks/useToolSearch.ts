import { useCallback, useState } from "react";

import { buildSearchQuery } from "@/common/operations/toolSearchOperations";
import { createClient } from "@/common/supabase/client";
import type { Database } from "@/types/supabase";

type Tool = Database["public"]["Tables"]["tools"]["Row"] & {
  profiles: {
    id: string;
    first_name: string;
    last_name: string;
  };
};

export function useToolSearch() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = buildSearchQuery({});
      const { data, error: queryError } = await query;

      if (queryError) {
        setError(queryError.message || "Failed to load tools");
      } else {
        await fetchAndCombineProfiles(data || []);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load tools";
      setError(errorMessage);
    }
    setLoading(false);
  }, []);

  const handleSearch = useCallback(async (searchParams: any) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildSearchQuery(searchParams);
      const { data, error: queryError } = await query;

      if (queryError) {
        setError(queryError.message || "Search failed");
      } else {
        await fetchAndCombineProfiles(data || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed";
      setError(errorMessage);
    }
    setLoading(false);
  }, []);

  const fetchAndCombineProfiles = async (toolsData: any[]) => {
    try {
      const supabase = createClient();

      const ownerIds = [...new Set(toolsData.map((tool) => tool.owner_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", ownerIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      const profilesMap = new Map();
      (profilesData || []).forEach((profile) => {
        profilesMap.set(profile.id, profile);
      });

      // Combine tools with profiles data
      const transformedData = toolsData.map((tool) => ({
        ...tool,
        profiles: profilesMap.get(tool.owner_id) || {
          id: tool.owner_id,
          first_name: "Unknown",
          last_name: "User",
        },
      }));
      setTools(transformedData);
    } catch (err) {
      console.error("Error combining profiles:", err);
      // Still set the tools even if profile fetching fails
      setTools(
        toolsData.map((tool) => ({
          ...tool,
          profiles: {
            id: tool.owner_id,
            first_name: "Unknown",
            last_name: "User",
          },
        })),
      );
    }
  };

  return {
    tools,
    loading,
    error,
    loadTools,
    handleSearch,
  };
}
