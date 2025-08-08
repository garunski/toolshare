import { useCallback } from "react";

import { createClient } from "../client";

import { useAuthSessionActions } from "./useAuthSessionActions";

const supabase = createClient();

export function useAuthActions(setAuthState: any) {
  const { refreshSession, clearError } = useAuthSessionActions(setAuthState);
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthState((prev: any) => ({ ...prev, loading: true, error: null }));
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

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
      const message = err instanceof Error ? err.message : "Sign in failed";
      setAuthState((prev: any) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      throw err;
    }
  }, [setAuthState]);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setAuthState((prev: any) => ({ ...prev, loading: true, error: null }));
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

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
      const message = err instanceof Error ? err.message : "Sign up failed";
      setAuthState((prev: any) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      throw err;
    }
  }, [setAuthState]);

  const signOut = useCallback(async () => {
    try {
      setAuthState((prev: any) => ({ ...prev, loading: true, error: null }));
      const { error } = await supabase.auth.signOut();

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
        user: null,
        loading: false,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign out failed";
      setAuthState((prev: any) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      throw err;
    }
  }, [setAuthState]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setAuthState((prev: any) => ({ ...prev, loading: true, error: null }));
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setAuthState((prev: any) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
        throw error;
      }

      setAuthState((prev: any) => ({ ...prev, loading: false }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Password reset failed";
      setAuthState((prev: any) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      throw err;
    }
  }, [setAuthState]);

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError,
    refreshSession,
  };
}
