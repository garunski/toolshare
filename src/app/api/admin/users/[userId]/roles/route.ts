import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/common/supabase/server";

import { RoleAssignmentOperations } from "../../../roles/assign/performRoleAssignment";
import {
  validateRoleAssignment,
  validateRoleRemoval,
} from "../../../roles/assign/validation";
import { RoleQueryOperations } from "../../../roles/list/getRoles";
import { RolePermissionOperations } from "../../../roles/permissions/managePermissions";

type RouteParams = {
  params: Promise<{
    userId: string;
  }>;
};

async function validateUserPermission(permission: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const hasPermission = await RolePermissionOperations.managePermissions(
    user.id,
    permission,
  );

  if (!hasPermission.hasPermission) {
    throw new Error("Insufficient permissions");
  }

  return user;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;
    await validateUserPermission("manage_users");
    const userRoles = await RoleQueryOperations.getUserRoles(userId);
    return NextResponse.json({
      success: true,
      data: userRoles,
    });
  } catch (error) {
    console.error("API Error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      error instanceof Error &&
      error.message === "Insufficient permissions"
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch user roles" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;
    await validateUserPermission("assign_roles");
    const body = await request.json();
    const validatedData = validateRoleAssignment({
      userId,
      roleId: body.roleId,
      expiresAt: body.expiresAt,
    });
    const userRole =
      await RoleAssignmentOperations.performRoleAssignment(validatedData);
    return NextResponse.json({
      success: true,
      data: userRole,
    });
  } catch (error) {
    console.error("API Error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      error instanceof Error &&
      error.message === "Insufficient permissions"
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: "Failed to assign role" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await params;
    await validateUserPermission("assign_roles");
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get("roleId");
    if (!roleId) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 },
      );
    }
    const validatedData = validateRoleRemoval({
      userId,
      roleId,
    });
    await RoleAssignmentOperations.assignRoleToUser(validatedData);
    return NextResponse.json({
      success: true,
      message: "Role removed successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      error instanceof Error &&
      error.message === "Insufficient permissions"
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { error: "Failed to remove role" },
      { status: 500 },
    );
  }
}
