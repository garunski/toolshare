import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/common/supabase/server";

import { RoleQueryOperations } from "./getRoles";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      // Get roles for specific user
      const userRoles = await RoleQueryOperations.getUserRoles(userId);
      return NextResponse.json({
        success: true,
        data: userRoles,
      });
    } else {
      // Get all roles
      const roles = await RoleQueryOperations.getRoles();
      return NextResponse.json({
        success: true,
        data: roles,
      });
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 },
    );
  }
}
