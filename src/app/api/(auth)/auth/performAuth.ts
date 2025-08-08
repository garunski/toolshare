import { createClient } from "@/common/supabase/server";

export interface SessionState {
  user: any | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

export class PerformAuth {
  /**
   * Get current session state
   */
  static async getSessionState(): Promise<SessionState> {
    const supabase = await createClient();

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        return {
          user: null,
          session: null,
          loading: false,
          error: error.message,
        };
      }

      if (!session) {
        return {
          user: null,
          session: null,
          loading: false,
          error: null,
        };
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        return {
          user: null,
          session: null,
          loading: false,
          error: userError.message,
        };
      }

      return {
        user,
        session,
        loading: false,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        loading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  /**
   * Refresh session
   */
  static async refreshSession(): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.auth.refreshSession();

    if (error) {
      throw new Error(`Failed to refresh session: ${error.message}`);
    }
  }

  /**
   * Validate current session
   */
  static async validateSession(): Promise<boolean> {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return false;
    }

    // Check if session is expired
    if (
      session.expires_at &&
      new Date(session.expires_at * 1000) < new Date()
    ) {
      return false;
    }

    return true;
  }

  /**
   * Check if session needs refresh
   */
  static async needsRefresh(): Promise<boolean> {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return false;
    }

    // Check if session expires within the next 5 minutes
    if (session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
      return expiresAt < fiveMinutesFromNow;
    }

    return false;
  }
}
