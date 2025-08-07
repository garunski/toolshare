import { NextRequest } from "next/server";

import { createClient } from "@/common/supabase/server";

import {
  createMissingFieldsResponse,
  createSuccessResponse,
  handleApiError,
  validateRequiredFields,
} from "../../../admin/roles/responses/responseHandler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, receiverId, message } = body;

    const requiredFields = ["senderId", "receiverId"];
    const { isValid, missingFields } = validateRequiredFields(
      body,
      requiredFields,
    );

    if (!isValid) {
      return createMissingFieldsResponse(missingFields);
    }

    const supabase = await createClient();
    const { error } = await supabase.from("friend_requests").insert({
      sender_id: senderId,
      receiver_id: receiverId,
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
