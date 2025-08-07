import { NextRequest, NextResponse } from "next/server";

import { generateSecurePassword, performUserCreation } from "./performUser";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate password if not provided
    if (!body.password) {
      body.password = generateSecurePassword();
    }

    const result = await performUserCreation(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("User creation route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
