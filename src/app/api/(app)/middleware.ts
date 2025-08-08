import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import { rateLimit } from "@/lib/rate-limit";

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

  // Rate limiting
  const identifier =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";
  const { success } = await rateLimit(identifier);

  if (!success) {
    return new NextResponse("Too Many Requests", { status: 429 });
  }

  // Authentication check (global middleware already validated, but double-check)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Add user context to request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user.id);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/(app)/:path*"],
};
