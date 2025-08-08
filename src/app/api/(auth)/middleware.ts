import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
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
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Auth routes - redirect if already authenticated
  // Global middleware already handles session refresh, so we just check current state
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch (error) {
    // If there's an error checking user, allow the request to proceed
    // The auth API routes will handle authentication properly
    console.error("Auth middleware error:", error);
  }

  return res;
}

export const config = {
  matcher: ["/api/(auth)/:path*"],
};
