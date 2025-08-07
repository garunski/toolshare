import { useEffect, useState } from "react";

import { type SessionState } from "@/common/operations/authListener";
import { SessionStateHandler } from "@/common/operations/sessionStateHandler";
import { SessionValidation } from "@/common/operations/sessionValidation";

export function useAuth() {
  const [authState, setAuthState] = useState<SessionState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const sessionManager = SessionStateHandler.getInstance();
    const unsubscribe = sessionManager.subscribe(setAuthState);

    return unsubscribe;
  }, []);

  const signOut = async () => {
    const sessionManager = SessionStateHandler.getInstance();
    await sessionManager.signOut();
  };

  const refreshSession = async () => {
    const sessionManager = SessionStateHandler.getInstance();
    await sessionManager.refreshSession();
  };

  const validateSession = async () => {
    return await SessionValidation.validateSession();
  };

  const needsRefresh = async () => {
    return await SessionValidation.needsRefresh();
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
