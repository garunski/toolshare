import { NextRequest, NextResponse } from "next/server";

import { TenantManager } from "./manageTenants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");
    const operation = searchParams.get("operation");
    const action = searchParams.get("action") as
      | "add_user"
      | "add_item"
      | "upload_file";
    const feature = searchParams.get("feature");
    const size = searchParams.get("size")
      ? parseInt(searchParams.get("size")!)
      : undefined;

    if (!tenantId || !operation) {
      return NextResponse.json(
        { error: "Tenant ID and operation are required" },
        { status: 400 },
      );
    }

    const result = await TenantManager.handleTenantOperations(
      tenantId,
      operation as any,
      action,
      feature || undefined,
      size,
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to handle tenant operation" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");
    const body = await request.json();

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant ID is required" },
        { status: 400 },
      );
    }

    const result = await TenantManager.configureTenant(tenantId, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to configure tenant" },
      { status: 500 },
    );
  }
}
