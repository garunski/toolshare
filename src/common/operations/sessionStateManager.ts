import { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/common/supabase";

export interface SessionState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export class SessionStateManager {
  private static instance: SessionStateManager;
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

  static getInstance(): SessionStateManager {
    if (!SessionStateManager.instance) {
      SessionStateManager.instance = new SessionStateManager();
    }
    return SessionStateManager.instance;
  }

  private async initializeAuthListener() {
    // Get initial session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      this.updateState({ error: error.message });
    } else {
      this.updateState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: null,
      });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
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

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      this.updateState({ error: error.message });
    }
  }

  async refreshSession(): Promise<void> {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      this.updateState({ error: error.message });
    } else {
      this.updateState({
        user: data.user,
        session: data.session,
        error: null,
      });
    }
  }
}
