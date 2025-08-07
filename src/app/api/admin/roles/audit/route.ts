import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/common/supabase/server";

import { AuditLoggingOperations, AuditQueryOperations } from "./auditLogger";

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
    const resourceType = searchParams.get("resourceType");
    const resourceId = searchParams.get("resourceId");
    const action = searchParams.get("action");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let auditLogs;

    if (userId) {
      auditLogs = await AuditQueryOperations.getAuditLogsForUser(
        userId,
        limit,
        offset,
      );
    } else if (resourceType && resourceId) {
      auditLogs = await AuditQueryOperations.getAuditLogsForResource(
        resourceType,
        resourceId,
        limit,
        offset,
      );
    } else if (action) {
      auditLogs = await AuditQueryOperations.getAuditLogsByAction(
        action,
        limit,
        offset,
      );
    } else if (startDate && endDate) {
      auditLogs = await AuditQueryOperations.getAuditLogsByDateRange(
        new Date(startDate),
        new Date(endDate),
        limit,
        offset,
      );
    } else {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: auditLogs,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, resourceType, resourceId, details, ipAddress, userAgent } =
      body;

    if (!action || !resourceType) {
      return NextResponse.json(
        { error: "Missing required fields: action, resourceType" },
        { status: 400 },
      );
    }

    await AuditLoggingOperations.logAuditEvent(
      user.id,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
      userAgent,
    );

    return NextResponse.json({
      success: true,
      message: "Audit event logged successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

    const { searchParams } = new URL(request.url);
    const olderThanDays = parseInt(searchParams.get("olderThanDays") || "90");

    const deletedCount =
      await AuditLoggingOperations.cleanOldAuditLogs(olderThanDays);

    return NextResponse.json({
      success: true,
      message: `Cleaned ${deletedCount} old audit logs`,
      deletedCount,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
