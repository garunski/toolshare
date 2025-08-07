import { NextRequest, NextResponse } from "next/server";

import { TenantConfigManager } from "./manageTenantConfig";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant ID is required" },
        { status: 400 },
      );
    }

    const config = await TenantConfigManager.getTenantConfig(tenantId);

    if (!config) {
      return NextResponse.json(
        { error: "Tenant configuration not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get tenant configuration" },
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

    const result = await TenantConfigManager.updateTenantConfig(tenantId, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update tenant configuration" },
      { status: 500 },
    );
  }
}
