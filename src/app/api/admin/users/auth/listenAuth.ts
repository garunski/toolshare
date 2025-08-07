import { createClient } from "@/common/supabase/server";

export interface SessionState {
  user: any | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

export interface AuthResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function listenAuthState(): Promise<AuthResult<SessionState>> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      if (
        error.message.includes("Refresh Token") ||
        error.message.includes("Invalid")
      ) {
        const { data: refreshData, error: refreshError } =
          await supabase.auth.refreshSession();

        if (refreshError) {
          await supabase.auth.signOut();
          return {
            success: true,
            data: {
              user: null,
              session: null,
              loading: false,
              error: "Session expired. Please sign in again.",
            },
          };
        }

        return {
          success: true,
          data: {
            user: refreshData.user,
            session: refreshData.session,
            loading: false,
            error: null,
          },
        };
      } else {
        return {
          success: true,
          data: {
            user: null,
            session: null,
            loading: false,
            error: error.message,
          },
        };
      }
    } else {
      return {
        success: true,
        data: {
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        },
      };
    }
  } catch (error) {
    console.error("Auth listener error:", error);
    return {
      success: true,
      data: {
        user: null,
        session: null,
        loading: false,
        error: "Authentication error occurred",
      },
    };
  }
}

export async function handleAuthEvent(
  event: string,
  session: any,
): Promise<AuthResult<SessionState>> {
  try {
    return {
      success: true,
      data: {
        user: session?.user ?? null,
        session,
        loading: false,
        error: null,
      },
    };
  } catch (error) {
    console.error("Auth event handler error:", error);
    return {
      success: false,
      error: "Failed to handle auth event",
    };
  }
}

export async function getCurrentAuthState(): Promise<AuthResult<SessionState>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return {
        success: true,
        data: {
          user: null,
          session: null,
          loading: false,
          error: error.message,
        },
      };
    }

    return {
      success: true,
      data: {
        user,
        session: null,
        loading: false,
        error: null,
      },
    };
  } catch (error) {
    console.error("Get current auth state error:", error);
    return {
      success: false,
      error: "Failed to get current auth state",
    };
  }
}
