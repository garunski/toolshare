import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    // Try to get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    // If there's an error getting the user, try to refresh the session
    if (userError) {
      const {
        data: { session },
        error: refreshError,
      } = await supabase.auth.refreshSession()

      // If refresh also fails, clear the session and continue
      if (refreshError) {
        // Clear invalid session cookies
        supabaseResponse.cookies.delete('sb-access-token')
        supabaseResponse.cookies.delete('sb-refresh-token')
        return supabaseResponse
      }

      // If refresh succeeds, update the response with new session
      if (session) {
        return supabaseResponse
      }
    }

    return supabaseResponse
  } catch (error) {
    // If any unexpected error occurs, clear session and continue
    supabaseResponse.cookies.delete('sb-access-token')
    supabaseResponse.cookies.delete('sb-refresh-token')
    return supabaseResponse
  }
} 