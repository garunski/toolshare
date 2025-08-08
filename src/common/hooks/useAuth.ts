import { useEffect, useState } from "react";

// Removed direct operation imports - now using API routes

interface SessionState {
  user: any | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<SessionState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const sessionState = await response.json();
          setAuthState(sessionState);
        } else {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: "Failed to load session",
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };

    loadSession();
  }, []);

  const signOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", { method: "POST" });
      if (response.ok) {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Sign out failed",
      }));
    }
  };

  const refreshSession = async () => {
    try {
      const response = await fetch("/api/auth/refresh", { method: "POST" });
      if (response.ok) {
        const sessionState = await response.json();
        setAuthState(sessionState);
      }
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Refresh failed",
      }));
    }
  };

  const validateSession = async () => {
    try {
      const response = await fetch("/api/auth/validate");
      return response.ok;
    } catch {
      return false;
    }
  };

  const needsRefresh = async () => {
    try {
      const response = await fetch("/api/auth/needs-refresh");
      const result = await response.json();
      return result.needsRefresh;
    } catch {
      return false;
    }
  };

  const clearError = () => {
    // Update state to clear error
    setAuthState((prev: SessionState) => ({ ...prev, error: null }));
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    signOut,
    refreshSession,
    validateSession,
    needsRefresh,
    clearError,
  };
}
