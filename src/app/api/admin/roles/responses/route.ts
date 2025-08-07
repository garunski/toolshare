import { NextRequest } from "next/server";

import { createClient } from "@/common/supabase/server";

import { ApiResponseHandlerOperations } from "./responseHandler";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return ApiResponseHandlerOperations.handleUnauthorized();
    }

    // This endpoint can be used to test response handlers
    return ApiResponseHandlerOperations.handleApiSuccess(
      { message: "Response handler is working" },
      "Response handler test successful",
    );
  } catch (error) {
    return ApiResponseHandlerOperations.handleApiError(
      error as Error,
      500,
      "Response handler test",
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return ApiResponseHandlerOperations.handleUnauthorized();
    }

    const body = await request.json();
    const { testType, message } = body;

    switch (testType) {
      case "success":
        return ApiResponseHandlerOperations.handleApiSuccess(
          { test: "success" },
          message || "Success test",
        );
      case "validation":
        return ApiResponseHandlerOperations.handleValidationError(
          { field: ["Field is required"] },
          message || "Validation test",
        );
      case "forbidden":
        return ApiResponseHandlerOperations.handleForbidden(
          message || "Forbidden test",
        );
      case "notFound":
        return ApiResponseHandlerOperations.handleNotFound(
          message || "Not found test",
        );
      case "conflict":
        return ApiResponseHandlerOperations.handleConflict(
          message || "Conflict test",
        );
      case "rateLimit":
        return ApiResponseHandlerOperations.handleRateLimitExceeded(
          message || "Rate limit test",
          60,
        );
      default:
        return ApiResponseHandlerOperations.handleApiError(
          "Invalid test type",
          400,
          "Response handler test",
        );
    }
  } catch (error) {
    return ApiResponseHandlerOperations.handleApiError(
      error as Error,
      500,
      "Response handler test",
    );
  }
}
