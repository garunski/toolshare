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
    const { userId, firstName, lastName, phone, address, bio } = body;

    const requiredFields = ["userId", "firstName", "lastName"];
    const { isValid, missingFields } = validateRequiredFields(
      body,
      requiredFields,
    );

    if (!isValid) {
      return createMissingFieldsResponse(missingFields);
    }

    const supabase = await createClient();
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      address: address || null,
      bio: bio || null,
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
