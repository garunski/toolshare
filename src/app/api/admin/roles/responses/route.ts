import { NextRequest } from "next/server";

import { ApiError, handleApiError } from "@/lib/api-error-handler";

import { ApiResponseHandlerOperations } from "./responseHandler";

export async function GET(request: NextRequest) {
  try {
    // Get admin context from middleware
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "admin") {
      throw new ApiError(403, "Admin access required", "ADMIN_REQUIRED");
    }

    const adminUserId = request.headers.get("x-user-id");
    if (!adminUserId) {
      throw new ApiError(
        401,
        "Admin user not authenticated",
        "ADMIN_UNAUTHORIZED",
      );
    }

    // This endpoint can be used to test response handlers
    return ApiResponseHandlerOperations.handleApiSuccess(
      { message: "Response handler is working" },
      "Response handler test successful",
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get admin context from middleware
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "admin") {
      throw new ApiError(403, "Admin access required", "ADMIN_REQUIRED");
    }

    const adminUserId = request.headers.get("x-user-id");
    if (!adminUserId) {
      throw new ApiError(
        401,
        "Admin user not authenticated",
        "ADMIN_UNAUTHORIZED",
      );
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
        throw new ApiError(400, "Invalid test type", "INVALID_TEST_TYPE");
    }
  } catch (error) {
    return handleApiError(error);
  }
}
