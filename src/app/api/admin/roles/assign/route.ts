import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/common/supabase/server";
import type { RoleAssignmentRequest, RoleRemovalRequest } from "@/types/roles";

import { RoleAssignmentOperations } from "./performRoleAssignment";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: RoleAssignmentRequest = await request.json();

    // Validate required fields
    if (!body.userId || !body.roleId) {
      return NextResponse.json(
        { error: "Missing required fields: userId, roleId" },
        { status: 400 },
      );
    }

    const result = await RoleAssignmentOperations.performRoleAssignment(body);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Role assignment error:", error);
    return NextResponse.json(
      { error: "Failed to assign role" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: RoleRemovalRequest = await request.json();

    // Validate required fields
    if (!body.userId || !body.roleId) {
      return NextResponse.json(
        { error: "Missing required fields: userId, roleId" },
        { status: 400 },
      );
    }

    await RoleAssignmentOperations.assignRoleToUser(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Role removal error:", error);
    return NextResponse.json(
      { error: "Failed to remove role" },
      { status: 500 },
    );
  }
}
