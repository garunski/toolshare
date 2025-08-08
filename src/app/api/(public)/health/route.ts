import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-error-handler";
import { logRequest } from "@/lib/request-logger";

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });

    // Log the health check request
    logRequest(request, response);

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
