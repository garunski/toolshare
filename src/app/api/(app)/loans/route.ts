import { NextRequest } from "next/server";

import { createClient } from "@/common/supabase/server";

import {
  createMissingFieldsResponse,
  createSuccessResponse,
  handleApiError,
  validateRequiredFields,
} from "../../admin/roles/responses/responseHandler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolId, borrowerId, startDate, endDate, message } = body;

    const requiredFields = ["toolId", "borrowerId", "startDate", "endDate"];
    const { isValid, missingFields } = validateRequiredFields(
      body,
      requiredFields,
    );

    if (!isValid) {
      return createMissingFieldsResponse(missingFields);
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
      throw error;
    }

    return createSuccessResponse();
  } catch (error) {
    return handleApiError(error);
  }
}
