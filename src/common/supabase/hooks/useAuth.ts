import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "../client";

const supabase = createClient();

import { useAuthActions } from "./useAuthActions";

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const { signIn, signUp, signOut, resetPassword, clearError, refreshSession } = useAuthActions(setAuthState);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          setAuthState((prev) => ({
            ...prev,
            loading: false,
            error: error.message,
          }));
          return;
        }

        setAuthState((prev) => ({
          ...prev,
          user: session?.user ?? null,
          loading: false,
        }));
      } catch (err) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to get session",
        }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState((prev) => ({
          ...prev,
          user: session?.user ?? null,
          loading: false,
        }));
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError,
    refreshSession,
  };
}
