import { useEffect, useState } from "react";

import {
  SessionState,
  SessionStateHandler,
} from "@/common/operations/sessionStateHandler";

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

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    signOut,
    refreshSession,
  };
}
