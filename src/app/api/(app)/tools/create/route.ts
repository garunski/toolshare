import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { performTool } from "./performTool";

export async function POST(request: NextRequest) {
  try {
    // Get user context from middleware headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new ApiError(401, "User not authenticated", "MISSING_USER_CONTEXT");
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.category) {
      throw new ApiError(
        400,
        "Missing required fields",
        "MISSING_REQUIRED_FIELDS",
      );
    }

    const result = await performTool(body, userId);

    if (!result.success) {
      throw new ApiError(
        400,
        result.error || "Tool creation failed",
        "TOOL_CREATION_FAILED",
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return handleApiError(error);
  }
}
