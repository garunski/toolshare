import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      throw new ApiError(
        400,
        "Email, password, first name, and last name are required",
        "MISSING_REQUIRED_FIELDS",
      );
    }

    // Validate password strength
    if (password.length < 6) {
      throw new ApiError(
        400,
        "Password must be at least 6 characters long",
        "WEAK_PASSWORD",
      );
    }

    // Create Supabase client
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
          },
        },
      },
    );

    // Attempt to sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        throw new ApiError(
          409,
          "User already exists with this email",
          "USER_EXISTS",
        );
      }
      throw new ApiError(400, "Registration failed", "REGISTRATION_FAILED");
    }

    if (!data.user) {
      throw new ApiError(500, "User creation failed", "USER_CREATION_FAILED");
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
