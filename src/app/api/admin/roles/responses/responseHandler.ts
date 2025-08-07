import { NextResponse } from "next/server";

// Re-export legacy functions for backward compatibility
export {
  createApiResponse,
  createMissingFieldsResponse,
  createSuccessResponse,
  handleApiError,
  validateRequiredFields,
} from "./legacyFunctions";

export class ApiResponseHandlerOperations {
  /**
   * Handle API success response
   */
  static handleApiSuccess(
    data: any,
    message: string = "Success",
    status: number = 200,
  ): NextResponse {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      { status },
    );
  }

  /**
   * Handle API error response
   */
  static handleApiError(
    error: Error | string,
    status: number = 500,
    context?: string,
  ): NextResponse {
    const errorMessage = typeof error === "string" ? error : error.message;
    const errorResponse = {
      success: false,
      error: errorMessage,
      ...(context && { context }),
    };

    console.error(`API Error${context ? ` (${context})` : ""}:`, errorMessage);
    return NextResponse.json(errorResponse, { status });
  }

  /**
   * Handle validation error response
   */
  static handleValidationError(
    errors: Record<string, string[]>,
    message: string = "Validation failed",
  ): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
        validationErrors: errors,
      },
      { status: 400 },
    );
  }

  /**
   * Handle unauthorized response
   */
  static handleUnauthorized(message: string = "Unauthorized"): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 401 },
    );
  }

  /**
   * Handle forbidden response
   */
  static handleForbidden(message: string = "Forbidden"): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 403 },
    );
  }

  /**
   * Handle not found response
   */
  static handleNotFound(message: string = "Resource not found"): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 404 },
    );
  }

  /**
   * Handle conflict response
   */
  static handleConflict(message: string = "Conflict"): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 409 },
    );
  }

  /**
   * Handle rate limit exceeded response
   */
  static handleRateLimitExceeded(
    message: string = "Rate limit exceeded",
    retryAfter?: number,
  ): NextResponse {
    const response = NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 429 },
    );

    if (retryAfter) {
      response.headers.set("Retry-After", retryAfter.toString());
    }

    return response;
  }
}
