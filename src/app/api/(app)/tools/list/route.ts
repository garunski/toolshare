import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { getTools } from "./getTools";

export async function GET(request: NextRequest) {
  try {
    // Get user context from middleware
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams);
    const tools = await getTools(filters);

    if (!tools.success) {
      throw new ApiError(400, tools.error || "Failed to fetch tools");
    }

    return NextResponse.json(tools.data);
  } catch (error) {
    return handleApiError(error);
  }
}
