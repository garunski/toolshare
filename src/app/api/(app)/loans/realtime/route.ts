import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { RealtimeConnectionManager } from "../../../../(app)/loans/operations/realtimeConnectionOperations";

import { handleRealtimeRequest } from "./handleRealtimeRequest";

export async function POST(request: NextRequest) {
  try {
    // Get user context from middleware headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new ApiError(401, "User not authenticated", "MISSING_USER_CONTEXT");
    }

    const body = await request.json();
    return await handleRealtimeRequest(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ApiError(400, "Invalid request data", "VALIDATION_ERROR");
    }
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user context from middleware headers
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new ApiError(401, "User not authenticated", "MISSING_USER_CONTEXT");
    }

    const status = RealtimeConnectionManager.getConnectionStatus();
    return NextResponse.json(status);
  } catch (error) {
    return handleApiError(error);
  }
}
