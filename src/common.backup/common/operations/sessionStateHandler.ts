import { createClient } from "@/common/supabase/client";

import { AuthListener, type SessionState } from "./authListener";

export class SessionStateHandler {
  private static instance: SessionStateHandler;
  private authListener: AuthListener;

  private constructor() {
    this.authListener = AuthListener.getInstance();
  }

  static getInstance(): SessionStateHandler {
    if (!SessionStateHandler.instance) {
      SessionStateHandler.instance = new SessionStateHandler();
    }
    return SessionStateHandler.instance;
  }

  subscribe(listener: (state: SessionState) => void): () => void {
    return this.authListener.subscribe(listener);
  }

  getCurrentState(): SessionState {
    return this.authListener.getCurrentState();
  }

  async signOut(): Promise<void> {
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        this.authListener.updateSessionState({ error: error.message });
      } else {
        // Clear state on successful sign out
        this.authListener.updateSessionState({
          user: null,
          session: null,
          error: null,
        });
      }
    } catch (error) {
      this.authListener.updateSessionState({
        error: error instanceof Error ? error.message : "Sign out failed",
      });
    }
  }

  async refreshSession(): Promise<void> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        // If refresh fails, clear the session
        if (
          error.message.includes("Refresh Token") ||
          error.message.includes("Invalid")
        ) {
          await this.clearInvalidSession();
        } else {
          this.authListener.updateSessionState({ error: error.message });
        }
      } else {
        this.authListener.updateSessionState({
          user: data.user,
          session: data.session,
          error: null,
        });
      }
    } catch (error) {
      this.authListener.updateSessionState({
        error:
          error instanceof Error ? error.message : "Session refresh failed",
      });
    }
  }

  private async clearInvalidSession(): Promise<void> {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      this.authListener.updateSessionState({
        user: null,
        session: null,
        error: "Session expired. Please sign in again.",
      });
    } catch (error) {
      // Even if sign out fails, clear the local state
      this.authListener.updateSessionState({
        user: null,
        session: null,
        error: "Session expired. Please sign in again.",
      });
    }
  }
}
