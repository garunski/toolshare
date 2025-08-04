import { NextRequest, NextResponse } from "next/server";

import { RoleAssignmentOperations } from "@/common/operations/roleAssignments";
import { RolePermissionOperations } from "@/common/operations/rolePermissions";
import { RoleQueryOperations } from "@/common/operations/roleQueries";
import { createClient } from "@/common/supabase/server";
import { RoleValidator } from "@/common/validators/roleValidator";

type RouteParams = {
  params: Promise<{
    userId: string;
  }>;
};
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await RolePermissionOperations.hasPermission(
      user.id,
      "manage_users",
    );

    if (!hasPermission.hasPermission) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const userRoles = await RoleQueryOperations.getUserRoles(userId);

    return NextResponse.json({
      success: true,
      data: userRoles,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user roles" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = await RolePermissionOperations.hasPermission(
      user.id,
      "assign_roles",
    );

    if (!hasPermission.hasPermission) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const validatedData = RoleValidator.validateRoleAssignment({
      userId,
      roleId: body.roleId,
      expiresAt: body.expiresAt,
    });

    const userRole =
      await RoleAssignmentOperations.assignUserRole(validatedData);

    return NextResponse.json({
      success: true,
      data: userRole,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to assign role" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const hasPermission = await RolePermissionOperations.hasPermission(
      user.id,
      "assign_roles",
    );
    if (!hasPermission.hasPermission) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get("roleId");

    if (!roleId) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 },
      );
    }
    const validatedData = RoleValidator.validateRoleRemoval({
      userId,
      roleId,
    });
    await RoleAssignmentOperations.removeUserRole(validatedData);
    return NextResponse.json({
      success: true,
      message: "Role removed successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to remove role" },
      { status: 500 },
    );
  }
}
