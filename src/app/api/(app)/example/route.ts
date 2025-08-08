import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";
import { logRequest } from "@/lib/request-logger";

export async function GET(request: NextRequest) {
  try {
    // Get user context from middleware headers
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      throw new ApiError(401, "User context not found", "MISSING_USER_CONTEXT");
    }

    // Example response
    const response = NextResponse.json({
      message: "Example API route with middleware protection",
      userId,
      timestamp: new Date().toISOString(),
      features: [
        "Authentication validation",
        "Rate limiting",
        "User context injection",
        "Centralized error handling",
      ],
    });

    // Log the request
    logRequest(request, response);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user context from middleware headers
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      throw new ApiError(401, "User context not found", "MISSING_USER_CONTEXT");
    }

    // Example of handling request body
    const body = await request.json();

    if (!body.message) {
      throw new ApiError(400, "Message is required", "MISSING_MESSAGE");
    }

    const response = NextResponse.json({
      message: "POST request processed successfully",
      receivedMessage: body.message,
      userId,
      timestamp: new Date().toISOString(),
    });

    // Log the request
    logRequest(request, response);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
