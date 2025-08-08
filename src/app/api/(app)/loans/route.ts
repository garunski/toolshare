import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/common/supabase/server";
import { ApiError, handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    // Get user context from middleware
    const borrowerId = request.headers.get("x-user-id");
    if (!borrowerId) {
      throw new ApiError(401, "User not authenticated");
    }

    const body = await request.json();
    const { toolId, startDate, endDate, message } = body;

    // Validate required fields
    const requiredFields = ["toolId", "startDate", "endDate"];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      throw new ApiError(
        400,
        `Missing required fields: ${missingFields.join(", ")}`,
        "MISSING_REQUIRED_FIELDS",
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("loans").insert({
      tool_id: toolId,
      borrower_id: borrowerId,
      start_date: startDate,
      end_date: endDate,
      message: message || null,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (error) {
      throw new ApiError(500, "Failed to create loan", "LOAN_CREATION_FAILED");
    }

    return NextResponse.json({
      success: true,
      message: "Loan created successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
