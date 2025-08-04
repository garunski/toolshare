import { NextRequest, NextResponse } from "next/server";

import { RolePermissionOperations } from "@/common/operations/rolePermissions";
import { RoleQueryOperations } from "@/common/operations/roleQueries";
import { createClient } from "@/common/supabase/server";

export async function GET(request: NextRequest) {
  try {
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
      "view_roles",
    );

    if (!hasPermission.hasPermission) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const roles = await RoleQueryOperations.getAllRolesWithPermissions();

    return NextResponse.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
      "manage_roles",
    );

    if (!hasPermission.hasPermission) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name, description, isSystemRole } = body;

    // Create new role
    const { data, error } = await supabase
      .from("roles")
      .insert({
        name,
        description,
        is_system_role: isSystemRole || false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create role: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 },
    );
  }
}
