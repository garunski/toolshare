import { NextRequest } from "next/server";

import {
  createMissingFieldsResponse,
  createSuccessResponse,
  handleApiError,
  validateRequiredFields,
} from "@/common/operations/apiResponseHandler";
import { createClient } from "@/common/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description, category, condition, location, notes } =
      body;

    const requiredFields = [
      "userId",
      "name",
      "description",
      "category",
      "condition",
    ];
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
