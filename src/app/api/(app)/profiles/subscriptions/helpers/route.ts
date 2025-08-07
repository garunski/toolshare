import { NextRequest, NextResponse } from "next/server";

import { SubscriptionHelpers } from "./subscriptionHelpers";

export async function POST(request: NextRequest) {
  try {
    const { userId, action, callback } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 },
      );
    }

    switch (action) {
      case "create":
        if (!callback) {
          return NextResponse.json(
            { error: "Missing callback for create action" },
            { status: 400 },
          );
        }
        const unsubscribe = SubscriptionHelpers.createUserSubscriptions(
          userId,
          callback,
        );
        return NextResponse.json({ success: true, unsubscribe });

      case "validate":
        const isValid =
          await SubscriptionHelpers.validateUserSubscription(userId);
        return NextResponse.json({ success: true, isValid });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'create' or 'validate'" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error managing user subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to manage user subscriptions" },
      { status: 500 },
    );
  }
}
