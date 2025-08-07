import { Session, User } from "@supabase/supabase-js";

import { createClient } from "@/common/supabase/client";

export interface SessionState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export class AuthListener {
  private static instance: AuthListener;
  private listeners: Set<(state: SessionState) => void> = new Set();
  private currentState: SessionState = {
    user: null,
    session: null,
    loading: true,
    error: null,
  };

  private constructor() {
    this.initializeAuthListener();
  }

  static getInstance(): AuthListener {
    if (!AuthListener.instance) {
      AuthListener.instance = new AuthListener();
    }
    return AuthListener.instance;
  }

  private async initializeAuthListener() {
    const supabase = createClient();

    try {
      // Get initial session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        // If there's an error getting the session, try to refresh it
        if (
          error.message.includes("Refresh Token") ||
          error.message.includes("Invalid")
        ) {
          const { data: refreshData, error: refreshError } =
            await supabase.auth.refreshSession();

          if (refreshError) {
            // If refresh fails, clear the session and set error
            await supabase.auth.signOut();
            this.updateState({
              user: null,
              session: null,
              loading: false,
              error: "Session expired. Please sign in again.",
            });
            return;
          }

          // If refresh succeeds, update with new session
          this.updateState({
            user: refreshData.user,
            session: refreshData.session,
            loading: false,
            error: null,
          });
        } else {
          this.updateState({ error: error.message });
        }
      } else {
        this.updateState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      this.updateState({
        error:
          error instanceof Error
            ? error.message
            : "Authentication error occurred",
      });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      // Clear any previous errors when auth state changes
      this.updateState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: null,
      });
    });
  }

  private updateState(newState: Partial<SessionState>) {
    this.currentState = { ...this.currentState, ...newState };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.currentState));
  }

  subscribe(listener: (state: SessionState) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.currentState);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  getCurrentState(): SessionState {
    return { ...this.currentState };
  }

  updateSessionState(newState: Partial<SessionState>) {
    this.updateState(newState);
  }
}
