import { NextRequest, NextResponse } from "next/server";

import { processFormError } from "@/common/forms/FormErrorProcessor";
import { supabase } from "@/common/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolId, borrowerId, startDate, endDate, message } = body;

    if (!toolId || !borrowerId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

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

    return NextResponse.json({ success: true });
  } catch (error) {
    const { fieldErrors, generalError } = processFormError(error);

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        {
          details: {
            errors: Object.entries(fieldErrors).map(([field, message]) => ({
              field,
              message,
            })),
          },
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: generalError || "An error occurred" },
      { status: 500 },
    );
  }
}
