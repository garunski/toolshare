import { NextRequest, NextResponse } from "next/server";

import { processFormError } from "@/common/forms/FormErrorProcessor";
import { supabase } from "@/common/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description, category, condition, location, notes } =
      body;

    if (!userId || !name || !description || !category || !condition) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

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
