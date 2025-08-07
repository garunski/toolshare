import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/common/supabase/server";

import { RolePermissionOperations } from "./managePermissions";

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
    const permissionName = searchParams.get("permissionName");

    if (!userId || !permissionName) {
      return NextResponse.json(
        { error: "Missing required parameters: userId, permissionName" },
        { status: 400 },
      );
    }

    const result = await RolePermissionOperations.managePermissions(
      userId,
      permissionName,
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Permission check error:", error);
    return NextResponse.json(
      { error: "Failed to check permissions" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { roleId, permissionIds } = body;

    if (!roleId || !Array.isArray(permissionIds)) {
      return NextResponse.json(
        { error: "Missing required fields: roleId, permissionIds" },
        { status: 400 },
      );
    }

    await RolePermissionOperations.updateRolePermissions(roleId, permissionIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Permission update error:", error);
    return NextResponse.json(
      { error: "Failed to update permissions" },
      { status: 500 },
    );
  }
}
