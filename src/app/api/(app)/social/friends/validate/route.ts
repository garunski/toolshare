import { NextRequest, NextResponse } from "next/server";

import { ValidateFriendRequest } from "./validateFriendRequest";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, receiverId, formData } = body;

    // Validate the request
    await ValidateFriendRequest.validateRequest(senderId, receiverId);

    // Validate form data if provided
    if (formData) {
      ValidateFriendRequest.validateFormData(formData);
    }

    return NextResponse.json({
      success: true,
      message: "Friend request validation passed",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Validation failed",
      },
      { status: 400 },
    );
  }
}
