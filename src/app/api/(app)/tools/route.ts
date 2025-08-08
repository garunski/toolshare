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
    const { name, description, category, condition, location, notes } = body;

    // Validate required fields
    const requiredFields = ["name", "description", "category", "condition"];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      throw new ApiError(
        400,
        `Missing required fields: ${missingFields.join(", ")}`,
        "MISSING_REQUIRED_FIELDS",
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("tools").insert({
      name,
      description,
      category,
      condition,
      location: location || null,
      notes: notes || null,
      owner_id: userId,
      status: "available",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new ApiError(500, "Failed to create tool", "TOOL_CREATION_FAILED");
    }

    return NextResponse.json({
      success: true,
      message: "Tool created successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
