import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { pathname } = request.nextUrl;

  try {
    // Try to get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // If there's an error getting the user, try to refresh the session
    if (userError) {
      const {
        data: { session },
        error: refreshError,
      } = await supabase.auth.refreshSession();

      // If refresh also fails, clear the session and continue
      if (refreshError) {
        // Clear invalid session cookies
        supabaseResponse.cookies.delete("sb-access-token");
        supabaseResponse.cookies.delete("sb-refresh-token");
        return supabaseResponse;
      }

      // If refresh succeeds, update the response with new session
      if (session) {
        return supabaseResponse;
      }
    }

    // Route protection logic
    // Public routes - no protection needed
    if (
      pathname === "/" ||
      pathname.startsWith("/terms") ||
      pathname.startsWith("/privacy") ||
      pathname.startsWith("/about") ||
      pathname.startsWith("/api/(public)")
    ) {
      return supabaseResponse;
    }

    // Auth routes - redirect if already authenticated
    if (
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/profile-setup") ||
      pathname.startsWith("/api/(auth)")
    ) {
      if (user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return supabaseResponse;
    }

    // Admin routes - require admin role
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Check admin role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return supabaseResponse;
    }

    // App routes - require authentication
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/tools") ||
      pathname.startsWith("/loans") ||
      pathname.startsWith("/social") ||
      pathname.startsWith("/api/(app)")
    ) {
      if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return supabaseResponse;
    }

    return supabaseResponse;
  } catch (error) {
    // If any unexpected error occurs, clear session and continue
    supabaseResponse.cookies.delete("sb-access-token");
    supabaseResponse.cookies.delete("sb-refresh-token");
    return supabaseResponse;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
