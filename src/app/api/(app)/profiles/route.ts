import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/common/supabase/server";
import { ApiError, handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    // Get user context from middleware
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const body = await request.json();
    const { firstName, lastName, phone, address, bio } = body;

    // Validate required fields
    const requiredFields = ["firstName", "lastName"];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      throw new ApiError(
        400,
        `Missing required fields: ${missingFields.join(", ")}`,
        "MISSING_REQUIRED_FIELDS",
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      address: address || null,
      bio: bio || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new ApiError(
        500,
        "Failed to create profile",
        "PROFILE_CREATION_FAILED",
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile created successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
