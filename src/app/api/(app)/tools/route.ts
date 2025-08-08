import { NextRequest } from "next/server";

import { createClient } from "@/common/supabase/server";
import { ApiError, handleApiError } from "@/lib/api-error-handler";

import {
  createMissingFieldsResponse,
  createSuccessResponse,
  validateRequiredFields,
} from "../../admin/roles/responses/responseHandler";

export async function POST(request: NextRequest) {
  try {
    // Get user context from middleware
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    const body = await request.json();
    const { name, description, category, condition, location, notes } = body;

    const requiredFields = ["name", "description", "category", "condition"];
    const { isValid, missingFields } = validateRequiredFields(
      body,
      requiredFields,
    );

    if (!isValid) {
      return createMissingFieldsResponse(missingFields);
    }

    const supabase = await createClient();
    const { error } = await supabase.from("tools").insert({
      name,
      description,
      category,
      condition,
      location: location || null,
      notes: notes || null,
      owner_id: userId,
      status: "available",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw error;
    }

    return createSuccessResponse();
  } catch (error) {
    return handleApiError(error);
  }
}
