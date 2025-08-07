import { createClient } from "@/common/supabase/server";

export interface SessionValidationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function validateSession(): Promise<
  SessionValidationResult<boolean>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        success: true,
        data: false,
      };
    }

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    console.error("Session validation error:", error);
    return {
      success: true,
      data: false,
    };
  }
}

export async function checkSessionNeedsRefresh(): Promise<
  SessionValidationResult<boolean>
> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: true,
        data: true,
      };
    }

    // Check if session expires within 5 minutes
    const expiresAt = session.expires_at;
    if (!expiresAt) {
      return {
        success: true,
        data: true,
      };
    }

    const now = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60;

    return {
      success: true,
      data: expiresAt - now < fiveMinutes,
    };
  } catch (error) {
    console.error("Check session refresh error:", error);
    return {
      success: true,
      data: true,
    };
  }
}

export async function clearInvalidSession(): Promise<
  SessionValidationResult<void>
> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    return {
      success: true,
    };
  } catch (error) {
    console.error("Clear invalid session error:", error);
    return {
      success: false,
      error: "Failed to clear session",
    };
  }
}

export async function getSessionExpiry(): Promise<
  SessionValidationResult<number | null>
> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return {
      success: true,
      data: session?.expires_at || null,
    };
  } catch (error) {
    console.error("Get session expiry error:", error);
    return {
      success: false,
      error: "Failed to get session expiry",
    };
  }
}
