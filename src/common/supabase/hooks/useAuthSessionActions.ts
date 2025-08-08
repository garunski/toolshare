import { useCallback } from "react";

import { createClient } from "../client";

const supabase = createClient();

export function useAuthSessionActions(setAuthState: any) {
  const refreshSession = useCallback(async () => {
    try {
      setAuthState((prev: any) => ({ ...prev, loading: true, error: null }));
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        setAuthState((prev: any) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        throw error;
      }

      setAuthState((prev: any) => ({
        ...prev,
        user: data.user,
        loading: false,
      }));

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Session refresh failed";
      setAuthState((prev: any) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      throw err;
    }
  }, [setAuthState]);

  const clearError = useCallback(() => {
    setAuthState((prev: any) => ({ ...prev, error: null }));
  }, [setAuthState]);

  return {
    refreshSession,
    clearError,
  };
}
