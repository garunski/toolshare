import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-error-handler";

export async function GET() {
  try {
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
