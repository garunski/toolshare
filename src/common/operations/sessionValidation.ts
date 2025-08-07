import { createClient } from "@/common/supabase/client";

export class SessionValidation {
  /**
   * Check if current session is valid
   */
  static async validateSession(): Promise<boolean> {
    const supabase = createClient();
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if session needs refresh
   */
  static async needsRefresh(): Promise<boolean> {
    const supabase = createClient();
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return true;

      // Check if session expires within 5 minutes
      const expiresAt = session.expires_at;
      if (!expiresAt) return true;

      const now = Math.floor(Date.now() / 1000);
      const fiveMinutes = 5 * 60;

      return expiresAt - now < fiveMinutes;
    } catch {
      return true;
    }
  }

  /**
   * Clear invalid session and cookies
   */
  static async clearInvalidSession(): Promise<void> {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Even if sign out fails, we've attempted to clear the session
      console.warn("Failed to clear session:", error);
    }
  }

  /**
   * Get session expiry time
   */
  static async getSessionExpiry(): Promise<number | null> {
    const supabase = createClient();
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.expires_at || null;
    } catch {
      return null;
    }
  }
}
