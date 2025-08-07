import { createClient } from "@/common/supabase/server";

export interface SessionState {
  user: any | null;
  session: any | null;
  error: string | null;
}

export interface SessionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function handleSessionSignOut(): Promise<SessionResult<void>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Session sign out error:", error);
    return {
      success: false,
      error: "Sign out failed",
    };
  }
}

export async function handleSessionRefresh(): Promise<SessionResult<any>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      // If refresh fails, clear the session
      if (
        error.message.includes("Refresh Token") ||
        error.message.includes("Invalid")
      ) {
        await clearInvalidSession();
        return {
          success: false,
          error: "Session expired. Please sign in again.",
        };
      } else {
        return {
          success: false,
          error: error.message,
        };
      }
    }

    return {
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    };
  } catch (error) {
    console.error("Session refresh error:", error);
    return {
      success: false,
      error: "Session refresh failed",
    };
  }
}

export async function getCurrentSession(): Promise<SessionResult<any>> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error("Get current session error:", error);
    return {
      success: false,
      error: "Failed to get current session",
    };
  }
}

async function clearInvalidSession(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Clear invalid session error:", error);
  }
}
