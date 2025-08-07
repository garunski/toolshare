import { NextRequest, NextResponse } from "next/server";

import { SubscriptionHelpers } from "./subscriptionHelpers";

export async function POST(request: NextRequest) {
  try {
    const { action, callback } = await request.json();

    switch (action) {
      case "create":
        if (!callback) {
          return NextResponse.json(
            { error: "Missing callback for create action" },
            { status: 400 },
          );
        }
        const unsubscribe =
          SubscriptionHelpers.createAdminSubscriptions(callback);
        return NextResponse.json({ success: true, unsubscribe });

      case "validate":
        const isValid = await SubscriptionHelpers.validateSubscription();
        return NextResponse.json({ success: true, isValid });

      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'create' or 'validate'" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error managing admin subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to manage admin subscriptions" },
      { status: 500 },
    );
  }
}
