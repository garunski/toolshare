import { NextRequest } from "next/server";

import {
  createMissingFieldsResponse,
  createSuccessResponse,
  handleApiError,
  validateRequiredFields,
} from "@/common/operations/apiResponseHandler";
import { supabase } from "@/common/supabase";

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
